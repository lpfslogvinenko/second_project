const Streak = require("../models/Streak");

async function getStreaks(req, res) {
  const streaks = await Streak.getStreakState(req.userId);
  const message =
    streaks.currentStreak >= 7
      ? "You are on fire — a full week of consistency."
      : streaks.currentStreak >= 3
        ? "Great momentum. Keep logging meals daily."
        : "Log at least one meal today to grow your streak.";

  return res.json({
    ...streaks,
    message,
  });
}

module.exports = { getStreaks };
