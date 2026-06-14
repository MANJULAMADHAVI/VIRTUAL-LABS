const router = require("express").Router();

const {
    getStudentProgress
} = require("./backend/controllers/progressController");

router.get("/:student_id", getStudentProgress);

module.exports = router;