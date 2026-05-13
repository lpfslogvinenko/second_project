const { query } = require("../utils/db");

function addDaysYmd(ymd, delta) {
  const d = new Date(ymd + "T12:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function todayUtcYmd() {
  return new Date().toISOString().slice(0, 10);
}

function toUtcYmd(value) {
  const d = new Date(value);
  return d.toISOString().slice(0, 10);
}

/**
 * Streaks derived from meals: consecutive UTC days with ≥1 meal.
 * Uses plain `logged_at` + JS date math so in-memory `pg-mem` matches PostgreSQL.
 */
async function getStreakState(userId) {
  const { rows } = await query(
    `
    SELECT logged_at
    FROM meals
    WHERE user_id = $1
    ORDER BY logged_at DESC;
    `,
    [userId]
  );

  const daySet = new Set();
  for (const r of rows) {
    daySet.add(toUtcYmd(r.logged_at));
  }
  const daysDesc = [...daySet].sort().reverse();  if (!daysDesc.length) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
      weeklyActiveDays: 0,
    };
  }

  const set = new Set(daysDesc);
  const today = todayUtcYmd();
  const yesterday = addDaysYmd(today, -1);
  let currentStreak = 0;
  let start = null;
  if (set.has(today)) start = today;
  else if (set.has(yesterday)) start = yesterday;
  if (start) {
    let cursor = start;
    while (set.has(cursor)) {
      currentStreak += 1;
      cursor = addDaysYmd(cursor, -1);
    }
  }

  const asc = [...daysDesc].sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of asc) {
    if (!prev) {
      run = 1;
    } else {
      run = d === addDaysYmd(prev, 1) ? run + 1 : 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }

  const weekCutoff = addDaysYmd(today, -7);
  const weeklyActiveDays = daysDesc.filter((d) => d >= weekCutoff).length;

  return {
    currentStreak: currentStreak,
    longestStreak: longest,
    lastLogDate: daysDesc[0],
    weeklyActiveDays,
  };
}

module.exports = { getStreakState };
