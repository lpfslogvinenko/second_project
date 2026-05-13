require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const mealRoutes = require("./routes/mealRoutes");
const userRoutes = require("./routes/userRoutes");
const streakRoutes = require("./routes/streakRoutes");
const telegramRoutes = require("./routes/telegramRoutes");

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(",").map((s) => s.trim()) : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/users", userRoutes);
app.use("/api/streaks", streakRoutes);
app.use("/telegram", telegramRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

module.exports = app;
