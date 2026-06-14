const db = require("../config/db");

exports.createQuestion = (req, res) => {
    const {
        title,
        description,
        language,
        difficulty,
        marks,
        sampleInput,
        sampleOutput,
        assignDate,
        assignTime,
        deadlineDate,
        deadlineTime,
        subject
    } = req.body;

    const faculty_id = req.user.id;
    const assign_date = assignDate && assignTime ? `${assignDate} ${assignTime}` : assignDate || null;
    const deadline = deadlineDate && deadlineTime ? `${deadlineDate} ${deadlineTime}` : deadlineDate || null;

    const sql = `
        INSERT INTO questions
        (faculty_id, title, description, language, difficulty, marks, sample_input, sample_output, assign_date, deadline, subject)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            faculty_id,
            title,
            description,
            language,
            difficulty,
            marks,
            sampleInput,
            sampleOutput,
            assign_date,
            deadline,
            subject || null
        ],
        (err, result) => {
            if (err && err.code === 'ER_BAD_FIELD_ERROR') {
                const fallbackSql = `
                    INSERT INTO questions
                    (faculty_id, title, description, language, difficulty, marks, sample_input, sample_output, assign_date, deadline)
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                return db.query(
                    fallbackSql,
                    [faculty_id, title, description, language, difficulty, marks, sampleInput, sampleOutput, assign_date, deadline],
                    (fallbackErr, fallbackResult) => {
                        if (fallbackErr) return res.status(500).json(fallbackErr);
                        res.json({
                            message: "Question Added",
                            questionId: fallbackResult.insertId
                        });
                    }
                );
            }
            if (err) return res.status(500).json(err);

            res.json({
                message: "Question Added",
                questionId: result.insertId
            });
        }
    );
};

exports.getQuestions = (req, res) => {
    const facultyId = req.query.faculty_id;
    let sql = `
        SELECT q.*, u.full_name AS faculty_name
        FROM questions q
        LEFT JOIN users u ON q.faculty_id = u.id
    `;
    const params = [];

    if (facultyId) {
        sql += ` WHERE q.faculty_id = ?`;
        params.push(facultyId);
    }

    sql += ` ORDER BY q.id DESC`;

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);

        res.json(result);
    });
};