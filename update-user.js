const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'jntua_labs'
});

conn.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
  
  conn.query('UPDATE users SET full_name = ? WHERE email = ?', ['John Developer', 'john.dev@test.com'], (err) => {
    if (err) throw err;
    console.log('✓ User updated with full_name = "John Developer"');
    conn.end();
    process.exit(0);
  });
});
