const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });
const mysql = require('mysql2/promise');

(async () => {
  let conn;
  try {
    const config = {
      host: process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306),
      user: process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
      database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DB || process.env.MYSQL_NAME || 'jntua_labs'
    };

    conn = await mysql.createConnection(config);

    const [users] = await conn.query("SELECT User, Host, plugin FROM mysql.user WHERE User='root'");
    console.log('USERS:', users);

    const [grants] = await conn.query("SHOW GRANTS FOR 'root'@'localhost'");
    console.log('GRANTS:');
    grants.forEach(g => console.log(Object.values(g).join(' ')));

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message || err);
    if (conn) try { await conn.end(); } catch (_) {}
    process.exit(1);
  }
})();
