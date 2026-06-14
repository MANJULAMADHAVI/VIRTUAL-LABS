const router = require("express").Router();

const authMiddleware = require("./backend/middleware/authMiddleware");

const {
    createQuestion,
    getQuestions
} = require("./backend/controllers/questionController");

router.post("/add", authMiddleware, createQuestion);
router.get("/", getQuestions);

module.exports = router;