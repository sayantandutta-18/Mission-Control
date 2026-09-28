const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        satelliteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Satellite",
            required: true
        },

        type: {
            type: String,
            enum: ["battery", "temperature", "signal", "attitude"],
            required: true
        },

        severity: {
            type: String,
            enum: ["warning", "critical"],
            required: true
        },

        message: {
            type: String,
            required: true
        },

        value: {
            type: Number,
            required: true
        },

        resolved: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;