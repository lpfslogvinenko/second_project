const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Meal = require("../models/Meal");
const User = require("../models/User");
const { analyzeMealPhoto } = require("../utils/photoRecognition");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^\w.\-]+/g, "_")}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

async function listMeals(req, res) {
  const meals = await Meal.listForUser(req.userId, { limit: 200 });
  return res.json({ meals });
}

async function createMealHandler(req, res) {
  const { description, calories } = req.body || {};
  let cal = calories != null ? Number(calories) : NaN;
  if (!Number.isFinite(cal)) cal = 0;

  let photo_path = null;
  let ai_label = null;

  if (req.file) {
    photo_path = req.file.filename;
    const buf = await fs.promises.readFile(req.file.path);
    const ai = await analyzeMealPhoto(buf);
    ai_label = ai.label;
    if (cal === 0 && ai.estimatedCalories != null) {
      cal = Number(ai.estimatedCalories) || 0;
    }
  }

  const meal = await Meal.createMeal(req.userId, {
    description,
    calories: cal,
    photo_path,
    ai_label,
  });
  return res.status(201).json({ meal });
}

async function dailySummary(req, res) {
  const user = await User.getById(req.userId);
  if (!user) return res.status(404).json({ error: "user_not_found" });
  const consumed = await Meal.sumCaloriesForDay(req.userId, new Date());
  return res.json({
    daily_calorie_goal: user.daily_calorie_goal,
    consumed_today: consumed,
    remaining: Math.max(0, user.daily_calorie_goal - consumed),
  });
}

module.exports = {
  listMeals,
  uploadMealPhoto: upload.single("photo"),
  createMealHandler,
  dailySummary,
};
