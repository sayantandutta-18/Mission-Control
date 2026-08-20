const express = require("express");

const {
    createSatellite,
    getAllSatellites,
    getSatelliteById
} = require("../controllers/satelliteController");

const router = express.Router();

router.post("/", createSatellite);
router.get("/", getAllSatellites);
router.get("/:id", getSatelliteById);

module.exports = router;