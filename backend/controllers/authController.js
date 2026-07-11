const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "jntua-labs-development-secret";

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body || {};

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "Missing required registration fields." });
        }

        const normalizedRole = ['student', 'faculty', 'admin'].includes(role) ? role : 'student';
        const hashedPassword = await bcrypt.hash(password, 10);
        const full_name = `${firstName} ${lastName}`;

        const sql = `
            INSERT INTO users(full_name, email, password, role)
            VALUES(?, ?, ?, ?)
        `;

        db.query(sql, [full_name, email, hashedPassword, normalizedRole], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ message: "Email already registered." });
                }
                console.error("Registration error:", err);
                return res.status(500).json({ message: "Registration failed.", error: err.message });
            }

            db.query(
                "INSERT INTO student_progress (student_id, total_questions, solved_questions, total_marks) VALUES (?, 0, 0, 0)",
                [result.insertId],
                (progressErr) => {
                    if (progressErr) {
                        console.error("Progress init error:", progressErr);
                    }
                    return res.json({ message: "User Registered" });
                }
            );
        });
    } catch (error) {
        console.error("Register exception:", error);
        return res.status(500).json({ message: "Registration failed.", error: error.message });
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        async (err, result) => {
            if (err) {
                console.error("Login query error:", err);
                return res.status(500).json({ message: "Login failed.", error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const user = result[0];

            try {
                const validPassword = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!validPassword) {
                    return res.status(401).json({
                        message: "Invalid Password"
                    });
                }

                const token = jwt.sign(
                    {
                        id: user.id,
                        role: user.role
                    },
                    JWT_SECRET,
                    { expiresIn: "7d" }
                );

                console.log('Login user:', user);
                console.log('Full name:', user.full_name);

                return res.json({
                    token,
                    userId: user.id,
                    role: user.role,
                    fullName: user.full_name || '',
                    firstName: user.full_name ? user.full_name.split(' ')[0] : '',
                    lastName: user.full_name ? user.full_name.split(' ').slice(1).join(' ') : ''
                });
            } catch (tokenErr) {
                console.error("Login token error:", tokenErr);
                return res.status(500).json({ message: "Login failed.", error: tokenErr.message });
            }
        }
    );
};