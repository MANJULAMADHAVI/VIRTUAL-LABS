const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

// Health check for AI service
router.get("/health", chatbotController.healthCheck);

// Main chatbot endpoint
router.post("/chat", chatbotController.chatWithAI);

module.exports = router;
