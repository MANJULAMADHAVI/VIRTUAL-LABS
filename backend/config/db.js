const mysql = require("mysql2");

function getDbConfig() {
    const dbUrl = process.env.DB_URL || process.env.MYSQL_URL;

    if (dbUrl) {
        const url = new URL(dbUrl);
        return {
            host: url.hostname,
            port: Number(url.port || 3306),
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.replace(/^\/+/, ""),
            ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
        };
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

db.connect((err) => {
    if (err) {
        console.log("MySQL connection error:", err.message);
    } else {
        console.log("MySQL Connected");
    }
});

module.exports = db;