const express = require("express");

const {
    getTelemetry,
    getTelemetryBySatellite
} = require("../controllers/telemetryController");

const router = express.Router();

router.get("/", getTelemetry);

router.get("/:satelliteId", getTelemetryBySatellite);

module.exports = router;