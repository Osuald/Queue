require("dotenv").config();
const express = require("express");
const cors = require("cors");

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "queuecare-jwt-secret-key-2024-dev";
  console.warn("JWT_SECRET not set. Using development fallback secret.");
}

const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const queueRoutes = require("./routes/queue");

const app = express();

const allowedOrigins = [
  "https://quecareclinic.vercel.app",
  "http://localhost:5173", // For local development
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Handle OPTIONS preflight for every route BEFORE other middleware
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/queue", queueRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
