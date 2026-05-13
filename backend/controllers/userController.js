const User = require("../models/User");

async function getProfile(req, res) {
  const user = await User.getById(req.userId);
  if (!user) return res.status(404).json({ error: "user_not_found" });
  return res.json({
    id: user.id,
    telegram_id: user.telegram_id,
    username: user.username,
    first_name: user.first_name,
    daily_calorie_goal: user.daily_calorie_goal,
    onboarding_completed: user.onboarding_completed,
  });
}

async function patchProfile(req, res) {
  const { daily_calorie_goal, onboarding_completed } = req.body || {};
  const user = await User.updateGoals(req.userId, {
    daily_calorie_goal,
    onboarding_completed,
  });
  if (!user) return res.status(404).json({ error: "user_not_found" });
  return res.json(user);
}

module.exports = { getProfile, patchProfile };
