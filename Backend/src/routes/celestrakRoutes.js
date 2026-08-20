const express = require("express");

const {
    getCelestrakSatellites
} = require("../controllers/celestrakController");

const router = express.Router();

router.get("/", getCelestrakSatellites);

module.exports = router;