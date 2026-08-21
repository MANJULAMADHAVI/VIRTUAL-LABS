const fetch = global.fetch;
const base = 'http://localhost:5001/api';

async function run(){
  try{
    const email = `faculty_demo_${Date.now()}@example.com`;
    const registerRes = await fetch(base + '/auth/register', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ firstName: 'Faculty', lastName: 'Demo', email, password: 'Password123!', role: 'faculty' })
    });
    const regJson = await registerRes.json();
    console.log('register:', regJson);

    const loginRes = await fetch(base + '/auth/login', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, password: 'Password123!' })
    });
    const loginJson = await loginRes.json();
    console.log('login:', loginJson);
    const token = loginJson.token;

    const createRes = await fetch(base + '/questions/add', {
      method: 'POST', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + token},
      body: JSON.stringify({ title: 'Sample from demo_run', description: 'Auto-created question', language:'C', difficulty:'Easy', marks:5, subject:'Demo' })
    });
    const createJson = await createRes.json();
    console.log('create:', createJson);

    const listRes = await fetch(base + '/questions');
    const listJson = await listRes.json();
    console.log('list count:', Array.isArray(listJson)?listJson.length: 'err', listJson[0]);
  }catch(e){
    console.error('ERR', e.message || e);
  }
}

run();
