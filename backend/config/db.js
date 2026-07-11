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

const pool = mysql.createPool({
    ...getDbConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

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

    const createQuestionsTable = `
        CREATE TABLE IF NOT EXISTS questions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            faculty_id INT,
            title VARCHAR(255),
            description TEXT,
            language VARCHAR(50),
            difficulty ENUM('Easy','Medium','Hard'),
            subject VARCHAR(100),
            marks INT,
            sample_input TEXT,
            sample_output TEXT,
            assign_date DATETIME,
            deadline DATETIME,
            FOREIGN KEY (faculty_id) REFERENCES users(id)
        ) ENGINE=InnoDB;
    `;

    const createSubmissionsTable = `
        CREATE TABLE IF NOT EXISTS submissions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id INT,
            question_id INT,
            code LONGTEXT,
            output TEXT,
            status ENUM('Pending','Accepted','Rejected') DEFAULT 'Pending',
            marks_obtained INT DEFAULT 0,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (question_id) REFERENCES questions(id)
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

    const ensureColumn = (tableName, columnName, definition, callback) => {
        pool.query(
            `SELECT COUNT(*) AS column_count
             FROM information_schema.columns
             WHERE table_schema = DATABASE()
               AND table_name = ?
               AND column_name = ?`,
            [tableName, columnName],
            (err, rows) => {
                if (err) {
                    console.error(`Failed to inspect ${tableName}.${columnName}:`, err.message || err);
                    return callback && callback(err);
                }

                const columnExists = Number(rows?.[0]?.column_count || 0) > 0;
                if (columnExists) {
                    return callback && callback();
                }

                pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`, (alterErr) => {
                    if (alterErr && alterErr.code !== "ER_DUP_FIELDNAME") {
                        console.error(`Failed to add ${tableName}.${columnName}:`, alterErr.message || alterErr);
                        return callback && callback(alterErr);
                    }
                    callback && callback();
                });
            }
        );
    };

    const schemaSteps = [
        { label: "users", sql: createUsersTable },
        { label: "questions", sql: createQuestionsTable },
        { label: "submissions", sql: createSubmissionsTable },
        { label: "student_progress", sql: createProgressTable }
    ];

    const runSchemaStep = (index = 0) => {
        const step = schemaSteps[index];
        if (!step) {
            const missingColumns = [
                ["questions", "sample_input", "TEXT"],
                ["questions", "sample_output", "TEXT"],
                ["questions", "assign_date", "DATETIME"],
                ["questions", "deadline", "DATETIME"],
                ["questions", "subject", "VARCHAR(100)"],
                ["submissions", "output", "TEXT"],
                ["submissions", "status", "ENUM('Pending','Accepted','Rejected') DEFAULT 'Pending'"],
                ["submissions", "marks_obtained", "INT DEFAULT 0"]
            ];

            const ensureNextColumn = (columnIndex = 0) => {
                if (columnIndex >= missingColumns.length) {
                    console.log("Database schema ensured.");
                    return;
                }

                const [tableName, columnName, definition] = missingColumns[columnIndex];
                ensureColumn(tableName, columnName, definition, (columnErr) => {
                    if (columnErr) {
                        console.error(`Schema column check stopped at ${tableName}.${columnName}.`);
                        return;
                    }
                    ensureNextColumn(columnIndex + 1);
                });
            };

            ensureNextColumn();
            return;
        }

        pool.query(step.sql, (err) => {
            if (err) {
                console.error(`Failed to ensure ${step.label}:`, err.message || err);
                return;
            }
            runSchemaStep(index + 1);
        });
    };

    runSchemaStep();
}

pool.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection error:", err.message || err);
        return;
    }
    console.log("MySQL Connected");
    if (connection) connection.release();
    ensureSchema();
});

module.exports = pool;