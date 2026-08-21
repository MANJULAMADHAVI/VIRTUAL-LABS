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
    const dbUrl = process.env.DB_URL || process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQLDATABASE_URL;
    const dbConfig = dbUrl ? parseDbUrl(dbUrl) : null;

    if (dbConfig) {
        return dbConfig;
    }

    const mysqlHost = process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOSTNAME || process.env.MYSQL_HOST || "localhost";
    const mysqlPort = Number(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306);
    const mysqlUser = process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || "root";
    const mysqlPassword = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || "";
    const mysqlDatabase = process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DB || process.env.MYSQL_NAME || "jntua_labs";

    return {
        host: mysqlHost,
        port: mysqlPort,
        user: mysqlUser,
        password: mysqlPassword,
        database: mysqlDatabase,
        ssl: process.env.DB_SSL === "true" || process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: false } : undefined
    };
}

const pool = mysql.createPool({
    ...getDbConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 30000,
    connectTimeout: 60000,
    dateStrings: true
});

const databaseStatus = {
    connected: false,
    schemaReady: false,
    error: null
};

pool.on("error", (err) => {
    console.error("Unexpected MySQL pool error:", err.message || err);
});

pool.on("connection", (connection) => {
    connection.on("error", (err) => {
        console.error("MySQL connection error:", err.message || err);
    });
});

let _heartbeat = null;
function startHeartbeat(intervalMs = 30000) {
    if (_heartbeat) return;
    _heartbeat = setInterval(() => {
        pool.query("SELECT 1", (pingErr) => {
            if (pingErr) {
                const msg = pingErr.message || pingErr;
                if (String(msg).toLowerCase().includes('pool is closed')) {
                    console.warn('MySQL heartbeat stopped: pool is closed. Clearing heartbeat.');
                    clearInterval(_heartbeat);
                    _heartbeat = null;
                    return;
                }
                console.warn("MySQL heartbeat ping failed:", msg);
            }
        });
    }, intervalMs);
}

function stopHeartbeat() {
    if (_heartbeat) {
        clearInterval(_heartbeat);
        _heartbeat = null;
    }
}

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
                    databaseStatus.schemaReady = true;
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

const databaseReady = new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            databaseStatus.error = err.message || String(err);
            console.error("MySQL connection error:", databaseStatus.error);
            reject(err);
            return;
        }

        console.log("MySQL Connected");
        databaseStatus.connected = true;
        if (connection) connection.release();
        ensureSchema();
        startHeartbeat();
        pool.query("SELECT 1", (queryError) => {
            if (queryError) {
                databaseStatus.error = queryError.message || String(queryError);
                reject(queryError);
                return;
            }
            resolve();
        });
    });
});

function getDatabaseStatus() {
    return {
        connected: databaseStatus.connected,
        schemaReady: databaseStatus.schemaReady,
        error: databaseStatus.error ? String(databaseStatus.error) : null
    };
}

process.on('exit', () => {
    stopHeartbeat();
});

module.exports = pool;
module.exports.databaseReady = databaseReady;
module.exports.getDatabaseStatus = getDatabaseStatus;