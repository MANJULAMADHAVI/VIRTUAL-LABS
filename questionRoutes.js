const router = require("express").Router();

const {
    createQuestion,
    getQuestions
} = require("../controllers/questionController");

router.post("/add", createQuestion);
router.get("/", getQuestions);

module.exports = router;