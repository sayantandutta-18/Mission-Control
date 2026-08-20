const express = require("express");

const {
    getAlerts,
    getAlertsBySatellite
} = require("../controllers/alertController");

const router = express.Router();

router.get("/", getAlerts);

router.get("/:satelliteId", getAlertsBySatellite);

module.exports = router;