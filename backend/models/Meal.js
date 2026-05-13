const { query } = require("../utils/db");

function startOfUtcDay(d = new Date()) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

async function createMeal(userId, { description, calories, photo_path, ai_label }) {
  const { rows } = await query(
    `
    INSERT INTO meals (user_id, description, calories, photo_path, ai_label)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
    [userId, description || null, calories ?? 0, photo_path || null, ai_label || null]
  );
  return rows[0];
}

async function listForUser(userId, { from, to, limit = 100 } = {}) {
  const params = [userId];
  let where = "WHERE user_id = $1";
  if (from) {
    params.push(from);
    where += ` AND logged_at >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    where += ` AND logged_at < $${params.length}`;
  }
  const lim = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
  params.push(lim);
  const limParam = `$${params.length}`;
  const { rows } = await query(
    `SELECT * FROM meals ${where} ORDER BY logged_at DESC LIMIT ${limParam}`,
    params
  );
  return rows;
}

async function sumCaloriesForDay(userId, day = new Date()) {
  const start = startOfUtcDay(day);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const { rows } = await query(
    `
    SELECT COALESCE(SUM(calories), 0)::int AS total
    FROM meals
    WHERE user_id = $1 AND logged_at >= $2 AND logged_at < $3;
    `,
    [userId, start.toISOString(), end.toISOString()]
  );
  return rows[0]?.total ?? 0;
}

module.exports = {
  createMeal,
  listForUser,
  sumCaloriesForDay,
  startOfUtcDay,
};
