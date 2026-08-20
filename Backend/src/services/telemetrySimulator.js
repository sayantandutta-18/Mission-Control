const Satellite = require("../models/Satellite");
const { generateTelemetry } = require("./telemetryService");
const { processTelemetry } = require("./alertService");

const startTelemetrySimulator = (io) => {
    setInterval(async () => {
        try {
            const satellites = await Satellite.find();

            console.log("Satellites found:", satellites.length);

            for (const satellite of satellites) {
                // Generate telemetry
                const telemetry = await generateTelemetry(satellite._id);

                // Check telemetry for anomalies
                const alerts = await processTelemetry(telemetry);

                // Send telemetry to connected clients
                io.emit("telemetry", telemetry);

                // Send alerts to connected clients
                for (const alert of alerts) {
                    io.emit("alert", alert);
                }

                console.log(
                    `Telemetry generated for: ${satellite.name}`,
                    telemetry._id
                );

                if (alerts.length > 0) {
                    console.log(
                        `Alerts generated for ${satellite.name}:`,
                        alerts.length
                    );
                }
            }

        } catch (error) {
            console.error(
                "Telemetry simulator error:",
                error.message
            );
        }
    }, 5000);
};

module.exports = {
    startTelemetrySimulator
};