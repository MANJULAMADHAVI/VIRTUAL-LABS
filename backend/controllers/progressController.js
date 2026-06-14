const db = require("../config/db");

exports.getStudentProgress = (req, res) => {
    const { student_id } = req.params;

    db.query(
        "SELECT * FROM student_progress WHERE student_id=?",
        [student_id],
        (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.length > 0) {
                return res.json(result[0]);
            }

            db.query(
                "INSERT INTO student_progress (student_id, total_questions, solved_questions, total_marks) VALUES (?, 0, 0, 0)",
                [student_id],
                (insertErr) => {
                    if (insertErr) return res.status(500).json(insertErr);
                    res.json({
                        student_id: Number(student_id),
                        total_questions: 0,
                        solved_questions: 0,
                        total_marks: 0,
                        acceptance_rate: 0
                    });
                }
            );
        }
    );
};