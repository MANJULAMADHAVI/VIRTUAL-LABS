const router = require("express").Router();

const {
    submitCode,
    getSubmissions
} = require("../controllers/submissionController");

router.post("/submit", submitCode);
router.get("/", getSubmissions);

module.exports = router;