const Satellite = require("../models/Satellite");

// Create a new satellite
const createSatellite = async (req, res) => {
    try {
        const satellite = await Satellite.create(req.body);

        res.status(201).json({
            success: true,
            message: "Satellite created successfully",
            data: satellite
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create satellite",
            error: error.message
        });
    }
};

// Get all satellites
const getAllSatellites = async (req, res) => {
    try {
        const satellites = await Satellite.find();

        res.status(200).json({
            success: true,
            count: satellites.length,
            data: satellites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch satellites",
            error: error.message
        });
    }
};

// Get one satellite
const getSatelliteById = async (req, res) => {
    try {
        const satellite = await Satellite.findById(req.params.id);

        if (!satellite) {
            return res.status(404).json({
                success: false,
                message: "Satellite not found"
            });
        }

        res.status(200).json({
            success: true,
            data: satellite
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch satellite",
            error: error.message
        });
    }
};

module.exports = {
    createSatellite,
    getAllSatellites,
    getSatelliteById
};