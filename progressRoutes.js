const router = require("express").Router();

const {
    getStudentProgress
} = require("../controllers/progressController");

router.get("/:student_id", getStudentProgress);

module.exports = router;