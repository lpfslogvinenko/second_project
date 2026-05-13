const { Router } = require("express");
const { authMiddleware } = require("../middleware/auth");
const { getStreaks } = require("../controllers/streakController");

const router = Router();

router.use(authMiddleware);
router.get("/", getStreaks);

module.exports = router;
