const express = require("express");
const router = express.Router();
const { createNonStreamingReply, streamReply } = require("../services/aiService");

router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const reply = await createNonStreamingReply(message, conversationHistory);
    return res.json(reply);
  } catch (error) {
    console.error("AI chat error:", error.message);
    return res.status(500).json({ message: "AI service unavailable" });
  }
});

router.get("/stream", async (req, res) => {
  const message = req.query.message || "";
  const conversationHistory = req.query.conversationHistory ? JSON.parse(req.query.conversationHistory) : [];
  await streamReply(res, message, conversationHistory);
});

router.get("/health", (req, res) => {
  res.json({ service: "AI Assistant", status: "ready", timestamp: new Date().toISOString() });
});

module.exports = router;
