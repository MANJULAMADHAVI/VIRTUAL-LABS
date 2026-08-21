const path = require('path');
const dotenv = require('dotenv');

// Load backend environment variables to match the running app
dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const pool = require('./backend/config/db');

function q(sql, params=[]) {
  return new Promise((res, rej) => {
    pool.query(sql, params, (err, rows) => {
      if (err) return rej(err);
      res(rows);
    });
  });
}

(async ()=>{
  try{
    const tables = await q('SHOW TABLES');
    console.log('TABLES:', tables.map(r => Object.values(r)[0]));

    const usersCount = await q('SELECT COUNT(*) AS cnt FROM users');
    console.log('USERS COUNT:', usersCount[0].cnt);

    const users = await q('SELECT id, full_name, email, role, created_at FROM users ORDER BY id DESC LIMIT 5');
    console.log('LATEST USERS:', users);

    const qcount = await q('SELECT COUNT(*) AS cnt FROM questions');
    console.log('QUESTIONS COUNT:', qcount[0].cnt);

    const questions = await q('SELECT id, title, faculty_id, language, difficulty, marks FROM questions ORDER BY id DESC LIMIT 10');
    console.log('LATEST QUESTIONS:', questions);

    process.exit(0);
  }catch(err){
    console.error('DB QUERY ERROR:', err.message || err);
    process.exit(1);
  }
})();
