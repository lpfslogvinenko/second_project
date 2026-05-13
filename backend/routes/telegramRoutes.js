const { Router } = require("express");
const { webhook, verifyWebhookSecret } = require("../controllers/botController");

const router = Router();

router.post("/webhook", verifyWebhookSecret, webhook);

module.exports = router;
