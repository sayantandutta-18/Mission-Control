const express = require("express");
const cors = require("cors");

const satelliteRoutes = require("./routes/satelliteRoutes");
const celestrakRoutes = require("./routes/celestrakRoutes");
const telemetryRoutes = require("./routes/telemetryRoutes");
const alertRoutes = require("./routes/alertRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// ===============================
// CORS
// ===============================
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// ===============================
// Body Parser
// ===============================
app.use(express.json());

// ===============================
// API Routes
// ===============================
app.use("/api/satellites", satelliteRoutes);

app.use("/api/celestrak", celestrakRoutes);

app.use("/api/telemetry", telemetryRoutes);

app.use("/api/alerts", alertRoutes);

app.use("/api/chat", aiRoutes);

// ===============================
// Health Check
// ===============================
app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Mission Control is running successfully!"
    });
});

module.exports = app;