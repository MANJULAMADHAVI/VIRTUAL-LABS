const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

// All analytics endpoints require authentication
// Admin-only access should be verified in frontend or via role checking

// Dashboard summary
router.get("/dashboard/summary", analyticsController.getDashboardSummary);

// Individual stats
router.get("/users/total", analyticsController.getTotalUsers);
router.get("/submissions/total", analyticsController.getTotalSubmissions);
router.get("/submissions/by-status", analyticsController.getSubmissionsByStatus);
router.get("/questions/stats", analyticsController.getQuestionsStats);
router.get("/progress/stats", analyticsController.getProgressStats);
router.get("/users/by-role", analyticsController.getUsersByRole);

// Top performers
router.get("/top-performers", analyticsController.getTopPerformers);

// Trends
router.get("/submissions/daily-trend", analyticsController.getDailyTrend);

module.exports = router;
