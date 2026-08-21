const base = 'http://localhost:5001/api';

const students = [
  { firstName: 'Amit', lastName: 'Kumar', email: `amit.${Date.now()}@example.com`, password: 'Student123!' },
  { firstName: 'Sneha', lastName: 'Rao', email: `sneha.${Date.now()}@example.com`, password: 'Student123!' },
  { firstName: 'Rahul', lastName: 'Verma', email: `rahul.${Date.now()}@example.com`, password: 'Student123!' },
  { firstName: 'Priya', lastName: 'Nair', email: `priya.${Date.now()}@example.com`, password: 'Student123!' },
  { firstName: 'Kriti', lastName: 'Shah', email: `kriti.${Date.now()}@example.com`, password: 'Student123!' }
];

async function run(){
  for(const s of students){
    try{
      const res = await fetch(base + '/auth/register', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ firstName: s.firstName, lastName: s.lastName, email: s.email, password: s.password, role: 'student' })
      });
      const json = await res.json();
      console.log('register', s.email, json);
    }catch(e){
      console.error('ERR', e.message || e);
    }
  }
}

run().catch(e=>console.error(e));
