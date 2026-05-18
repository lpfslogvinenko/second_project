const app = require("./app");
const User = require("./models/User");

const port = Number(process.env.PORT) || 4000;

// ---------- Настройки для автоустановки вебхука ----------
const BOT_TOKEN = process.env.BOT_TOKEN;
const PROXY_URL = "https://telegram-proxy.tiny-frost-8d1a.lpfslogvinenko.workers.dev";
const BACKEND_URL = process.env.RENDER_EXTERNAL_URL; // мы добавили её на Render

async function setupWebhook() {
  if (!BOT_TOKEN || !BACKEND_URL) {
    console.warn("⚠️  BOT_TOKEN или RENDER_EXTERNAL_URL не заданы – вебхук не установлен");
    return;
  }

  const webhookUrl = `${BACKEND_URL}/telegram/webhook`;
  const setWebhookUrl = `${PROXY_URL}/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

  try {
    const response = await fetch(setWebhookUrl, { method: "POST" });
    const data = await response.json();
    console.log("✅ Webhook setup result:", JSON.stringify(data));
  } catch (err) {
    console.error("❌ Webhook setup failed:", err);
  }
}
// --------------------------------------------------------

async function main() {
  await User.ensureSchema();
  app.listen(port, () => {
    console.log(`API listening on :${port}`);
    setupWebhook(); // ← автоустановка при каждом запуске
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});