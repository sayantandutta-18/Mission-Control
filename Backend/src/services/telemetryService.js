const Telemetry = require("../models/Telemetry");

const generateTelemetry = async (satelliteId) => {
    try {
        const telemetry = {
            satelliteId: satelliteId,

            battery: Math.floor(Math.random() * 41) + 60,

            temperature: Math.floor(Math.random() * 21) + 20,

            signal: Math.floor(Math.random() * 21) + 80,

            attitude: Number((Math.random() * 5).toFixed(2))
        };

        const savedTelemetry = await Telemetry.create(telemetry);

        return savedTelemetry;

    } catch (error) {
        console.error(
            "Telemetry generation failed:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    generateTelemetry
};
