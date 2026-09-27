const mongoose = require("mongoose");

const telemetrySchema = new mongoose.Schema(
    {
        satelliteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Satellite",
            required: true
        },

        battery: {
            type: Number,
            required: true
        },

        temperature: {
            type: Number,
            required: true
        },

        signal: {
            type: Number,
            required: true
        },

        attitude: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Telemetry = mongoose.model("Telemetry", telemetrySchema);

module.exports = Telemetry;