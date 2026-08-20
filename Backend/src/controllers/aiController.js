const { GoogleGenAI } = require("@google/genai");

const Satellite = require("../models/Satellite");
const Alert = require("../models/Alert");

const handleChat = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        // ==========================================
        // 1. ENVIRONMENT CONFIGURATION
        // ==========================================

        console.log(
            "AI_API_KEY loaded:",
            !!process.env.AI_API_KEY
        );

        console.log(
            "AI_MODEL:",
            process.env.AI_MODEL || "gemini-2.5-flash"
        );

        // ==========================================
        // 2. VALIDATE MESSAGE
        // ==========================================

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required."
            });
        }

        // ==========================================
        // 3. CHECK API KEY
        // ==========================================

        if (!process.env.AI_API_KEY) {
            return res.status(500).json({
                success: false,
                message:
                    "AI_API_KEY is not configured in backend environment."
            });
        }

        // ==========================================
        // 4. INITIALIZE GEMINI
        // ==========================================

        const ai = new GoogleGenAI({
            apiKey: process.env.AI_API_KEY
        });

        const model =
            process.env.AI_MODEL || "gemini-2.5-flash";

        // ==========================================
        // 5. FETCH SATELLITES
        // ==========================================

        const satellites = await Satellite
            .find()
            .lean();

        // ==========================================
        // 6. FETCH RECENT ALERTS
        // ==========================================
        // IMPORTANT:
        // Alert schema currently does NOT contain
        // a "resolved" field, so don't filter by it.

        const alerts = await Alert
            .find()
            .sort({
                createdAt: -1
            })
            .limit(100)
            .lean();

        // ==========================================
        // 7. IDENTIFY CRITICAL SATELLITES
        // ==========================================

        const criticalSatelliteIds = new Set(
            alerts
                .filter(
                    alert =>
                        alert.severity === "critical"
                )
                .map(
                    alert =>
                        alert.satelliteId?.toString()
                )
        );

        const criticalSatellites = satellites
            .filter(satellite => {
                const hasCriticalStatus =
                    satellite.status === "critical";

                const hasCriticalAlert =
                    criticalSatelliteIds.has(
                        satellite._id.toString()
                    );

                return (
                    hasCriticalStatus ||
                    hasCriticalAlert
                );
            })
            .map(
                satellite =>
                    satellite.name
            );

        // ==========================================
        // 8. IDENTIFY WARNING SATELLITES
        // ==========================================

        const warningSatelliteIds = new Set(
            alerts
                .filter(
                    alert =>
                        alert.severity === "warning"
                )
                .map(
                    alert =>
                        alert.satelliteId?.toString()
                )
        );

        const warningSatellites = satellites
            .filter(satellite => {

                // Critical satellites should never
                // also be counted as warning.
                if (
                    satellite.status === "critical" ||
                    criticalSatelliteIds.has(
                        satellite._id.toString()
                    )
                ) {
                    return false;
                }

                const hasWarningStatus =
                    satellite.status === "warning";

                const hasWarningAlert =
                    warningSatelliteIds.has(
                        satellite._id.toString()
                    );

                return (
                    hasWarningStatus ||
                    hasWarningAlert
                );
            })
            .map(
                satellite =>
                    satellite.name
            );

        // ==========================================
        // 9. CALCULATE FLEET STATUS
        // ==========================================

        const criticalCount =
            criticalSatellites.length;

        const warningCount =
            warningSatellites.length;

        const healthyCount = Math.max(
            0,
            satellites.length -
            criticalCount -
            warningCount
        );

        // ==========================================
        // 10. FORMAT ALERTS
        // ==========================================

        const formattedAlerts =
            alerts
                .map(alert => {

                    const satellite =
                        satellites.find(
                            satellite =>
                                satellite._id
                                    .toString() ===
                                alert.satelliteId
                                    ?.toString()
                        );

                    return `- ${
                        alert.severity
                            ?.toUpperCase() ||
                        "UNKNOWN"
                    } | ${
                        satellite?.name ||
                        "Unknown Satellite"
                    } | ${
                        alert.type ||
                        "unknown"
                    } | ${
                        alert.message ||
                        "No message"
                    } | Value: ${
                        alert.value ??
                        "N/A"
                    }`;
                })
                .join("\n") ||
            "No alerts recorded.";

        // ==========================================
        // 11. BUILD MISSION CONTEXT
        // ==========================================

        const contextSummary = `
MISSION CONTROL DATA

FLEET SUMMARY
Total Satellites: ${satellites.length}
Healthy Satellites: ${healthyCount}
Warning Satellites: ${warningCount}
Critical Satellites: ${criticalCount}

CRITICAL SATELLITES
${
    criticalSatellites.length > 0
        ? criticalSatellites.join(", ")
        : "None"
}

WARNING SATELLITES
${
    warningSatellites.length > 0
        ? warningSatellites.join(", ")
        : "None"
}

RECENT ALERTS
${formattedAlerts}
`;

        // ==========================================
        // 12. AI SYSTEM INSTRUCTION
        // ==========================================

        const systemInstruction = `
You are MISSION AI, an expert satellite
mission-control assistant.

Your job is to analyze the provided
Mission Control data and answer the
operator's questions accurately.

CURRENT MISSION DATA:

${contextSummary}

IMPORTANT RULES:

1. Use the provided mission data as the
   primary source of truth.

2. Never invent satellite names,
   telemetry values, alerts, or statuses.

3. A satellite with a CRITICAL alert must
   be treated as requiring immediate
   attention, even if its Satellite.status
   field still says "healthy".

4. A satellite with a WARNING alert must
   be treated as a warning condition,
   unless it also has a critical condition.

5. When calculating mission health, use
   the calculated fleet summary above.

6. If there are critical satellites,
   do NOT say that the entire fleet is
   healthy.

7. If there are no critical alerts,
   clearly state that there are no active
   critical alerts.

8. If the user asks for satellites needing
   immediate attention, list the critical
   satellites first.

9. If the user asks about alerts, mention
   the alert severity, satellite, type,
   message and value when available.

10. Keep responses concise, professional,
    and suitable for a satellite mission
    control operator.

11. Use bullet points when listing multiple
    satellites or alerts.

12. If the requested information is not
    available in the mission data, say so
    instead of guessing.
`;

        // ==========================================
        // 13. PREPARE CHAT HISTORY
        // ==========================================

        const formattedHistory = history
            .filter(
                msg =>
                    msg &&
                    msg.content &&
                    msg.content.trim()
            )
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

        // ==========================================
        // 14. ADD CURRENT USER MESSAGE
        // ==========================================

        formattedHistory.push({
            role: "user",
            parts: [
                {
                    text: message.trim()
                }
            ]
        });

        // ==========================================
        // 15. SEND REQUEST TO GEMINI
        // ==========================================

        console.log(
            "Sending request to Gemini..."
        );

        const response =
            await ai.models.generateContent({
                model,
                contents: formattedHistory,
                config: {
                    systemInstruction,
                    temperature: 0.3
                }
            });

        // ==========================================
        // 16. RETURN RESPONSE
        // ==========================================

        console.log(
            "Gemini response received."
        );

        return res.status(200).json({
            success: true,
            response: response.text
        });

    } catch (error) {

        // ==========================================
        // ERROR HANDLING
        // ==========================================

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