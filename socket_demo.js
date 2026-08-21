const { io } = require('socket.io-client');

const url = 'http://localhost:5001';

async function runDemo(){
  const a = io(url);
  const b = io(url);

  a.on('connect', ()=>{
    console.log('A connected', a.id);
    a.emit('join-room','demo-room');
  });

  b.on('connect', ()=>{
    console.log('B connected', b.id);
    b.emit('join-room','demo-room');
  });

  b.on('assistant-message', (payload)=>{
    console.log('B received assistant-message:', payload);
    a.disconnect();
    b.disconnect();
    process.exit(0);
  });

  // wait for connections
  setTimeout(()=>{
    console.log('A sending message to room');
    a.emit('assistant-message',{roomId:'demo-room', text:'hello from A via Node demo', ts:Date.now()});
  }, 1000);

  setTimeout(()=>{
    console.log('Demo timeout, exiting');
    process.exit(1);
  }, 5000);
}

runDemo();
