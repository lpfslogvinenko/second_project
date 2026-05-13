const { Router } = require("express");
const { authMiddleware } = require("../middleware/auth");
const {
  listMeals,
  uploadMealPhoto,
  createMealHandler,
  dailySummary,
} = require("../controllers/mealController");

const router = Router();

router.use(authMiddleware);

router.get("/", listMeals);
router.get("/summary", dailySummary);
router.post("/", uploadMealPhoto, createMealHandler);

module.exports = router;
