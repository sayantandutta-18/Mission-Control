const Telemetry = require("../models/Telemetry");

const getTelemetry = async (req, res) => {
    try {
        const telemetry = await Telemetry.find()
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            count: telemetry.length,
            data: telemetry
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch telemetry",
            error: error.message
        });
    }
};

const getTelemetryBySatellite = async (req, res) => {
    try {
        const telemetry = await Telemetry.find({
            satelliteId: req.params.satelliteId
        })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: telemetry.length,
            data: telemetry
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch satellite telemetry",
            error: error.message
        });
    }
};

module.exports = {
    getTelemetry,
    getTelemetryBySatellite
};
