const { query } = require("../utils/db");

async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      telegram_id BIGINT UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT,
      daily_calorie_goal INT NOT NULL DEFAULT 2000,
      onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS meals (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      description TEXT,
      calories INT NOT NULL DEFAULT 0,
      photo_path TEXT,
      ai_label TEXT,
      logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_meals_user_logged ON meals(user_id, logged_at DESC);
  `);
}

async function findByTelegramId(telegramId) {
  const { rows } = await query(
    `SELECT * FROM users WHERE telegram_id = $1 LIMIT 1`,
    [telegramId]
  );
  return rows[0] || null;
}

async function upsertFromTelegram(telegramUser) {
  const { id, username, first_name } = telegramUser;
  const { rows } = await query(
    `
    INSERT INTO users (telegram_id, username, first_name)
    VALUES ($1, $2, $3)
    ON CONFLICT (telegram_id) DO UPDATE
      SET username = EXCLUDED.username,
          first_name = EXCLUDED.first_name,
          updated_at = NOW()
    RETURNING *;
    `,
    [id, username || null, first_name || null]
  );
  return rows[0];
}

async function getById(userId) {
  const { rows } = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
  return rows[0] || null;
}

async function updateGoals(userId, { daily_calorie_goal, onboarding_completed }) {
  const fields = [];
  const values = [];
  let i = 1;
  if (daily_calorie_goal != null) {
    fields.push(`daily_calorie_goal = $${i++}`);
    values.push(Number(daily_calorie_goal));
  }
  if (onboarding_completed != null) {
    fields.push(`onboarding_completed = $${i++}`);
    values.push(Boolean(onboarding_completed));
  }
  if (!fields.length) {
    return getById(userId);
  }
  fields.push(`updated_at = NOW()`);
  values.push(userId);
  const { rows } = await query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows[0];
}

module.exports = {
  ensureSchema,
  findByTelegramId,
  upsertFromTelegram,
  getById,
  updateGoals,
};
