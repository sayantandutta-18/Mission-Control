const Alert = require("../models/Alert");
const Satellite = require("../models/Satellite");
const { checkTelemetry } = require("./anomalyDetector");

const processTelemetry = async (telemetry) => {
    try {
        const anomalies = checkTelemetry(telemetry);

        const alerts = [];

        // Determine satellite health status
        let satelliteStatus = "healthy";

        for (const anomaly of anomalies) {

            // Critical anomaly → critical satellite
            if (anomaly.severity === "critical") {
                satelliteStatus = "critical";
            }

            // Warning anomaly → warning satellite
            else if (
                anomaly.severity === "warning" &&
                satelliteStatus !== "critical"
            ) {
                satelliteStatus = "warning";
            }

            // Check if the same active alert already exists
            const existingAlert = await Alert.findOne({
                satelliteId: telemetry.satelliteId,
                type: anomaly.type,
                severity: anomaly.severity,
                resolved: false
            });

            // Don't create duplicate active alerts
            if (existingAlert) {
                continue;
            }

            // Create new alert
            const alert = await Alert.create({
                satelliteId: telemetry.satelliteId,
                type: anomaly.type,
                severity: anomaly.severity,
                message: anomaly.message,
                value: anomaly.value
            });

            alerts.push(alert);
        }

        // Update satellite health status
        await Satellite.findByIdAndUpdate(
            telemetry.satelliteId,
            {
                status: satelliteStatus
            },
            {
                new: true
            }
        );

        return alerts;

    } catch (error) {
        console.error(
            "Alert processing failed:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    processTelemetry
};