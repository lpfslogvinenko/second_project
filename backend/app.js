require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const mealRoutes = require("./routes/mealRoutes");
const userRoutes = require("./routes/userRoutes");
const streakRoutes = require("./routes/streakRoutes");
const telegramRoutes = require("./routes/telegramRoutes");

const app = express();

/** Strip trailing slashes so CORS matches Telegram/WebView Origin headers. */
function normalizeOriginHeader(value) {
  if (!value) return "";
  return String(value).trim().replace(/\/+$/, "");
}

/**
 * Telegram Web / desktop embeds often send Origin from the Telegram host, not
 * your Vercel domain — without these, fetch() to Render fails in the client.
 */
const TELEGRAM_EMBED_ORIGINS = [
  "https://web.telegram.org",
  "https://webk.telegram.org",
  "https://telegram.org",
  "https://telegram.me",
];

function corsOriginOption() {
  const raw = (process.env.CORS_ORIGIN || "").trim();
  if (!raw) return true;
  const fromEnv = raw
    .split(",")
    .map((s) => normalizeOriginHeader(s))
    .filter(Boolean);
  const allowed = [...new Set([...fromEnv, ...TELEGRAM_EMBED_ORIGINS])];
  return (requestOrigin, callback) => {
    if (!requestOrigin) {
      callback(null, true);
      return;
    }
    const normalized = normalizeOriginHeader(requestOrigin);
    callback(null, allowed.includes(normalized));
  };
}

app.use(
  cors({
    origin: corsOriginOption(),
    credentials: false,
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
