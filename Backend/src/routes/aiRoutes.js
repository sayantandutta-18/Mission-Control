const express = require("express");
const { handleChat } = require("../controllers/aiController");

const router = express.Router();

router.post("/", handleChat);

module.exports = router;
