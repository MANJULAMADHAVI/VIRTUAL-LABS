const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    createQuestion,
    getQuestions
} = require("../controllers/questionController");

router.post("/add", authMiddleware, createQuestion);
router.get("/", getQuestions);

module.exports = router;