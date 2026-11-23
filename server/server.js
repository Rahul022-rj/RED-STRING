const express = require("express");
const cors = require("cors");
const caseRoutes = require("./routes/caseRoutes");
const gameRoutes = require("./routes/gameRoutes");
const generateRoutes = require("./routes/generateRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/cases", caseRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/generate", generateRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, () => console.log("RED STRING server on http://localhost:" + PORT));
