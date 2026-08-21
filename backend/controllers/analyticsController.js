const db = require("../config/db");

exports.getTotalUsers = (req, res) => {
  db.query("SELECT COUNT(*) as total FROM users", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ totalUsers: result[0].total });
  });
};

exports.getTotalSubmissions = (req, res) => {
  db.query("SELECT COUNT(*) as total FROM submissions", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ totalSubmissions: result[0].total });
  });
};

exports.getSubmissionsByStatus = (req, res) => {
  const sql = `
    SELECT status, COUNT(*) as count 
    FROM submissions 
    GROUP BY status
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.getQuestionsStats = (req, res) => {
  const sql = `
    SELECT 
      difficulty,
      language,
      COUNT(*) as count,
      AVG(marks) as avg_marks
    FROM questions
    GROUP BY difficulty, language
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.getProgressStats = (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total,
      AVG(solved_questions) as avg_problems,
      AVG(total_marks) as avg_score
    FROM student_progress
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
};

exports.getUsersByRole = (req, res) => {
  // If a specific role is requested, return detailed user rows for that role
  const role = req.query.role;
  if (role) {
    const sql = `
      SELECT u.id, u.full_name, u.email, u.role, COALESCE(sp.solved_questions,0) as solved_questions, COALESCE(sp.total_marks,0) as total_marks, u.created_at
      FROM users u
      LEFT JOIN student_progress sp ON u.id = sp.student_id
      WHERE u.role = ?
      ORDER BY u.full_name ASC
    `;
    db.query(sql, [role], (err, result) => {
      if (err) return res.status(500).json(err);
      return res.json(result);
    });
  } else {
    const sql = `
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `;

    db.query(sql, (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  }
};

exports.getTopPerformers = (req, res) => {
  const limit = parseInt(req.query.limit || 10, 10);
  const sql = `
    SELECT 
      u.id,
      u.full_name,
      COALESCE(sp.solved_questions, 0) as solved_questions,
      COALESCE(sp.total_marks, 0) as total_marks,
      COUNT(s.id) as total_submissions
    FROM users u
    LEFT JOIN student_progress sp ON u.id = sp.student_id
    LEFT JOIN submissions s ON u.id = s.student_id
    WHERE u.role = 'student'
    GROUP BY u.id, u.full_name, sp.solved_questions, sp.total_marks
    ORDER BY solved_questions DESC, total_marks DESC, total_submissions DESC
    LIMIT ${limit}
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.getDashboardSummary = (req, res) => {
  const summary = {};
  let completed = 0;

  db.query("SELECT COUNT(*) as total FROM users", (err, result) => {
    if (!err) summary.totalUsers = result[0].total;
    completed++;
    checkComplete();
  });

  db.query("SELECT COUNT(*) as total FROM submissions", (err, result) => {
    if (!err) summary.totalSubmissions = result[0].total;
    completed++;
    checkComplete();
  });

  db.query("SELECT COUNT(*) as total FROM questions", (err, result) => {
    if (!err) summary.totalQuestions = result[0].total;
    completed++;
    checkComplete();
  });

  db.query("SELECT AVG(total_marks) as avg FROM student_progress", (err, result) => {
    if (!err) summary.avgScore = parseFloat(result[0].avg || 0).toFixed(2);
    completed++;
    checkComplete();
  });

  function checkComplete() {
    if (completed === 4) {
      res.json(summary);
    }
  }
};

exports.getDailyTrend = (req, res) => {
  const days = req.query.days || 30;
  const sql = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as submissions
    FROM submissions
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${parseInt(days)} DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};
