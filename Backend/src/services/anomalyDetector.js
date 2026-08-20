const checkTelemetry = (telemetry) => {
    const anomalies = [];

    // Battery check
    if (telemetry.battery < 20) {
        anomalies.push({
            type: "battery",
            severity: "critical",
            message: "Battery level critically low",
            value: telemetry.battery
        });
    } else if (telemetry.battery < 50) {
        anomalies.push({
            type: "battery",
            severity: "warning",
            message: "Battery level is low",
            value: telemetry.battery
        });
    }

    // Temperature check
    if (telemetry.temperature > 90) {
        anomalies.push({
            type: "temperature",
            severity: "critical",
            message: "Temperature is critically high",
            value: telemetry.temperature
        });
    } else if (telemetry.temperature > 70) {
        anomalies.push({
            type: "temperature",
            severity: "warning",
            message: "Temperature is high",
            value: telemetry.temperature
        });
    }

    // Signal check
    if (telemetry.signal < 20) {
        anomalies.push({
            type: "signal",
            severity: "critical",
            message: "Signal strength is critically low",
            value: telemetry.signal
        });
    } else if (telemetry.signal < 40) {
        anomalies.push({
            type: "signal",
            severity: "warning",
            message: "Signal strength is low",
            value: telemetry.signal
        });
    }

    return anomalies;
};

module.exports = {
    checkTelemetry
};