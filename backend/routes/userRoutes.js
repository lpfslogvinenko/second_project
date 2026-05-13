const { Router } = require("express");
const { authMiddleware } = require("../middleware/auth");
const { getProfile, patchProfile } = require("../controllers/userController");

const router = Router();

router.use(authMiddleware);

router.get("/me", getProfile);
router.patch("/me", patchProfile);

module.exports = router;
