const User = require("../models/User");
const Meal = require("../models/Meal");

/**
 * Minimal Telegram Bot API update handler for /start, /stats, /goal.
 * Register webhook: POST https://api.telegram.org/bot<token>/setWebhook
 * with url https://<heroku-app>.herokuapp.com/telegram/webhook
 */
async function handleUpdate(update) {
  const msg = update.message || update.edited_message;
  if (!msg || !msg.text) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const parts = text.split(/\s+/);
  const cmd = parts[0].split("@")[0].toLowerCase();

  const send = async (t) => {
    const { telegramApiCall } = require("../utils/telegramApi");
    return telegramApiCall("sendMessage", { chat_id: chatId, text: t });
  };

  if (cmd === "/start") {
    await send(
      "Welcome! Open the Mini App from the menu button to log meals and track streaks."
    );
    return;
  }

  if (text === '/appss_verify') {
    // Отправляем ответ строго тем же сообщением (reply)
    return sendMessage(chatId, 'appss_9bb0c9');
  }

  const from = msg.from;
  if (!from) return;

  const userRow = await User.upsertFromTelegram(from);

  if (cmd === "/stats") {
    const consumed = await Meal.sumCaloriesForDay(userRow.id, new Date());
    await send(
      `Today: ${consumed} / ${userRow.daily_calorie_goal} kcal. Open the app for charts and streaks.`
    );
    return;
  }

  if (cmd === "/goal") {
    const n = Number(parts[1]);
    if (!Number.isFinite(n) || n < 500 || n > 20000) {
      await send("Usage: /goal 2200 — set your daily calorie target.");
      return;
    }
    await User.updateGoals(userRow.id, { daily_calorie_goal: n });
    await send(`Daily goal updated to ${n} kcal.`);
  }
}

function verifyWebhookSecret(req, res, next) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return next();
  const token = req.get("X-Telegram-Bot-Api-Secret-Token");
  if (token !== secret) {
    return res.status(403).json({ error: "forbidden" });
  }
  return next();
}

async function webhook(req, res) {
  try {
    await handleUpdate(req.body);
  } catch (e) {
    console.error("handleUpdate error", e);
  }
  return res.sendStatus(200);
}

module.exports = { handleUpdate, webhook, verifyWebhookSecret };