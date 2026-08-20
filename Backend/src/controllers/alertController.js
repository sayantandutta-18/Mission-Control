const Alert = require("../models/Alert");

const getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find()
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            count: alerts.length,
            data: alerts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch alerts",
            error: error.message
        });
    }
};

const getAlertsBySatellite = async (req, res) => {
    try {
        const alerts = await Alert.find({
            satelliteId: req.params.satelliteId
        })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: alerts.length,
            data: alerts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch satellite alerts",
            error: error.message
        });
    }
};

module.exports = {
    getAlerts,
    getAlertsBySatellite
};