const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyTelegramInitData } = require("../utils/telegramApi");

function signUserToken(user) {
  return jwt.sign(
    { sub: String(user.id), tid: String(user.telegram_id) },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

async function telegramAuth(req, res) {
  const { initData } = req.body || {};
  const verified = verifyTelegramInitData(
    initData,
    process.env.TELEGRAM_BOT_TOKEN
  );
  if (!verified.ok || !verified.user) {
    return res.status(401).json({ error: verified.error || "unauthorized" });
  }

  const user = await User.upsertFromTelegram(verified.user);
  const token = signUserToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      telegram_id: user.telegram_id,
      username: user.username,
      first_name: user.first_name,
      daily_calorie_goal: user.daily_calorie_goal,
      onboarding_completed: user.onboarding_completed,
    },
  });
}

/** Local browser only: never enable in production. */
async function devAuth(_req, res) {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "not_found" });
  }
  if (process.env.ENABLE_DEV_AUTH !== "1") {
    return res.status(403).json({ error: "dev_auth_disabled" });
  }
  const user = await User.upsertFromTelegram({
    id: 999000001,
    username: "dev_browser",
    first_name: "Dev",
  });
  const token = signUserToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      telegram_id: user.telegram_id,
      username: user.username,
      first_name: user.first_name,
      daily_calorie_goal: user.daily_calorie_goal,
      onboarding_completed: user.onboarding_completed,
    },
  });
}

module.exports = { telegramAuth, devAuth, signUserToken };
