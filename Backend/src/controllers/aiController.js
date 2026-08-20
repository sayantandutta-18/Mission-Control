const { GoogleGenAI } = require("@google/genai");

const Satellite = require("../models/Satellite");
const Alert = require("../models/Alert");

const handleChat = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        // Check environment configuration
        console.log(
            "AI_API_KEY loaded:",
            !!process.env.AI_API_KEY
        );

        console.log(
            "AI_MODEL:",
            process.env.AI_MODEL || "gemini-3.6-flash"
        );

        // Validate message
        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required."
            });
        }

        // Validate API key
        if (!process.env.AI_API_KEY) {
            return res.status(500).json({
                success: false,
                message:
                    "AI_API_KEY is not configured in backend environment."
            });
        }

        // Initialize Gemini
        const ai = new GoogleGenAI({
            apiKey: process.env.AI_API_KEY
        });

        // Gemini model
        const model =
            process.env.AI_MODEL || "gemini-3.6-flash";

        // Fetch satellites
        const satellites = await Satellite.find().lean();

        // Fetch recent alerts
        const alerts = await Alert.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Find critical satellites
        const criticalSatellites =
            satellites
                .filter(s => s.status === "critical")
                .map(s => s.name)
                .join(", ") || "None";

        // Find warning satellites
        const warningSatellites =
            satellites
                .filter(s => s.status === "warning")
                .map(s => s.name)
                .join(", ") || "None";

        // Format alerts
        const activeAlerts =
            alerts
                .map(alert => {
                    const satellite = satellites.find(
                        s =>
                            s._id.toString() ===
                            alert.satelliteId?.toString()
                    );

                    return `- ${
                        alert.severity?.toUpperCase() || "UNKNOWN"
                    } on ${
                        satellite?.name ||
                        alert.satelliteId ||
                        "Unknown satellite"
                    }: ${
                        alert.message || "No message"
                    }`;
                })
                .join("\n") || "No active alerts";

        // Mission context
        const contextSummary = `
MISSION CONTROL CONTEXT

Total Satellites: ${satellites.length}

Critical Satellites:
${criticalSatellites}

Warning Satellites:
${warningSatellites}

Recent Alerts:
${activeAlerts}
`;

        // AI system instruction
        const systemInstruction = `
You are MISSION AI, an expert satellite mission-control assistant.

Use the following mission data to answer the user's questions:

${contextSummary}

Rules:
- Be concise and professional.
- Focus on satellite operations.
- Do not invent satellite data.
- If information is unavailable, clearly say so.
- Use bullet points when useful.
`;

        // Prepare chat history
        const formattedHistory = history
            .filter(msg => msg?.content)
            .map(msg => ({
                role:
                    msg.role === "user"
                        ? "user"
                        : "model",
                parts: [
                    {
                        text: msg.content
                    }
                ]
            }));

        // Add current user message
        formattedHistory.push({
            role: "user",
            parts: [
                {
                    text: message
                }
            ]
        });

        console.log(
            "Sending request to Gemini..."
        );

        // Gemini request
        const response =
            await ai.models.generateContent({
                model,
                contents: formattedHistory,
                config: {
                    systemInstruction
                }
            });

        console.log(
            "Gemini response received."
        );

        return res.status(200).json({
            success: true,
            response: response.text
        });

    } catch (error) {

        console.error(
            "========== AI CHAT ERROR =========="
        );

        console.error(error);

        console.error(
            "==================================="
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to process AI request",
            error: error.message
        });
    }
};

module.exports = {
    handleChat
};