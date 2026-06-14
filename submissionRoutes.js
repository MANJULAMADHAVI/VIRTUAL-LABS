const router = require("express").Router();

const {
    submitCode,
    getSubmissions
} = require("./backend/controllers/submissionController");

router.post("/submit", submitCode);
router.get("/", getSubmissions);

module.exports = router;