const { Router } = require("express");
const { telegramAuth, devAuth } = require("../controllers/authController");

const router = Router();

router.post("/telegram", telegramAuth);
router.post("/dev", devAuth);

module.exports = router;
