const mongoose = require("mongoose");

const satelliteSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },

        noradId: {
            type: Number,
            required: true,
            unique: true
        },

        tleLine1: {
            type: String,
            required: true
        },

        tleLine2: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["healthy", "warning", "critical"],
            default: "healthy"
        }
    },
    {
        timestamps: true
    }
);

const Satellite = mongoose.model("Satellite", satelliteSchema);

module.exports = Satellite;