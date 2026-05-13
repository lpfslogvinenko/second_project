const crypto = require("crypto");

/**
 * Validates Telegram.WebApp.initData per
 * https://core.telegram.org/bots/webapp#validating-data-received-via-the-mini-app
 * @param {string} initData - raw initData string from the Mini App
 * @param {string} botToken - TELEGRAM_BOT_TOKEN
 * @param {number} [maxAgeSec=86400] - reject if auth_date older than this
 */
function verifyTelegramInitData(initData, botToken, maxAgeSec = 86400) {
  if (!initData || !botToken) {
    return { ok: false, error: "missing_init_data_or_token" };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    return { ok: false, error: "missing_hash" };
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) {
    return { ok: false, error: "missing_auth_date" };
  }
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > maxAgeSec) {
    return { ok: false, error: "init_data_expired" };
  }

  const dataCheck = [];
  for (const [key, value] of params.entries()) {
    if (key === "hash") continue;
    dataCheck.push(`${key}=${value}`);
  }
  dataCheck.sort();
  const dataCheckString = dataCheck.join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const computed = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computed !== hash) {
    return { ok: false, error: "invalid_hash" };
  }

  const userRaw = params.get("user");
  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      return { ok: false, error: "invalid_user_json" };
    }
  }

  return { ok: true, user, authDate };
}

/**
 * Minimal Telegram Bot API helper for sending messages / setting webhook.
 */
async function telegramApiCall(method, body) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) {
    const err = new Error(json.description || "telegram_api_error");
    err.telegram = json;
    throw err;
  }
  return json.result;
}

module.exports = { verifyTelegramInitData, telegramApiCall };
