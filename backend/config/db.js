const mysql = require("mysql2");

function parseDbUrl(dbUrl) {
    try {
        const url = new URL(dbUrl);
        return {
            host: url.hostname,
            port: Number(url.port || 3306),
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.replace(/^\/+/, ""),
            ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
        };
    } catch (error) {
        console.warn("Invalid DB URL provided, falling back to individual DB_* env vars.", error.message);
        return null;
    }
}

function getDbConfig() {
    const dbUrl = process.env.DB_URL || process.env.MYSQL_URL || process.env.DATABASE_URL;
    const dbConfig = dbUrl ? parseDbUrl(dbUrl) : null;

    if (dbConfig) {
        return dbConfig;
    }

    return {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "jntua_labs",
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
    };
}

const db = mysql.createConnection(getDbConfig());

function ensureSchema() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            full_name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            password VARCHAR(255),
            role ENUM('student','faculty','admin') DEFAULT 'student',
            department VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    `;

    const createProgressTable = `
        CREATE TABLE IF NOT EXISTS student_progress (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id INT,
            total_questions INT DEFAULT 0,
            solved_questions INT DEFAULT 0,
            total_marks INT DEFAULT 0,
            FOREIGN KEY (student_id) REFERENCES users(id)
        ) ENGINE=InnoDB;
    `;

    db.query(createUsersTable, (err) => {
        if (err) {
            console.error("Failed to create users table:", err.message || err);
            return;
        }
        db.query(createProgressTable, (progressErr) => {
            if (progressErr) {
                console.error("Failed to create student_progress table:", progressErr.message || progressErr);
            } else {
                console.log("Database schema ensured.");
            }
        });
    });
}

db.connect((err) => {
    if (err) {
        console.log("MySQL connection error:", err.message);
    } else {
        console.log("MySQL Connected");
        ensureSchema();
    }
});

module.exports = db;