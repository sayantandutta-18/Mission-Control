const express = require("express");
const cors = require("cors");
const satelliteRoutes = require("./routes/satelliteRoutes");
const app = express();
const celestrakRoutes = require("./routes/celestrakRoutes");
const telemetryRoutes = require("./routes/telemetryRoutes");
const alertRoutes = require("./routes/alertRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/api/alerts", alertRoutes);
app.use(cors());
app.use(express.json());
app.use("/api/satellites", satelliteRoutes);
app.use("/api/celestrak", celestrakRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/chat", aiRoutes);
app.get("/api", (req, res) => {

  res.status(200).json({ 
    success: true,
    message: "Mission Control is running successfully!"
  });
});

module.exports = app;