const express = require("express");
const { chatHandler } = require("../../controller/chat_controller/chat.controller");
const authenticate = require("../../middleware/authorize");
const router = express.Router();

router.post("/chat", authenticate, chatHandler);

module.exports = router;
