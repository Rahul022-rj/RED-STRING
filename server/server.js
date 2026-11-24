require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const wrap = require("./middleware/wrap");
const { optionalAuth } = require("./middleware/auth");
const caseRoutes = require("./routes/caseRoutes");
const gameRoutes = require("./routes/gameRoutes");
const generateRoutes = require("./routes/generateRoutes");
const authRoutes = require("./routes/authRoutes");
const meRoutes = require("./routes/meRoutes");
const { leaderboard, caseLeaderboard } = require("./controllers/meController");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1); // correct client IPs for rate limiting behind Render/Railway
// Allowed browser origins: the web dev server, the mobile app's WebView
// (Capacitor serves from https://localhost on Android, capacitor://localhost on iOS),
// plus any extra comma-separated origins in FRONTEND_URL.
// Auth uses bearer tokens (no cookies), so allowing these origins is safe.
const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
  ...String(process.env.FRONTEND_URL || "").split(",").map((s) => s.trim()).filter(Boolean)
]);
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin))
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
);
app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/generate", generateRoutes);
app.get("/api/leaderboard", wrap(optionalAuth), wrap(leaderboard));
app.get("/api/leaderboard/case/:caseId", wrap(caseLeaderboard));
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

// In production the server also hosts the built React app, so one URL serves everything.
const dist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log("RED STRING server on http://localhost:" + PORT));
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    console.error("Set MONGODB_URI in server/.env (see server/.env.example).");
    process.exit(1);
  });
