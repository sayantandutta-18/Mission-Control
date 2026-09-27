require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const http = require("http");

const app = require("./src/app.js");
const connectDB = require("./src/config/db.js");

const {
    startTelemetrySimulator
} = require("./src/services/telemetrySimulator");

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT}`);
        });

        startTelemetrySimulator(io);

    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
};

startServer();