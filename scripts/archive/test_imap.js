require('dotenv').config({path: '/home/ubuntu/.openclaw/workspace/residentialist/.env'});

const Imap = require('imap');

console.log('Testing IMAP connection with loaded credentials...\n');
console.log('EMAIL_ADDRESS:', process.env.EMAIL_ADDRESS);
console.log('IMAP_SERVER:', process.env.IMAP_SERVER);
console.log('IMAP_PORT:', process.env.IMAP_PORT);
console.log('PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'NOT SET');
console.log('');

const testImap = new Imap({
  user: process.env.EMAIL_ADDRESS,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.IMAP_SERVER || 'imap.gmail.com',
  port: process.env.IMAP_PORT || 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

testImap.once('ready', () => {
  console.log('✅ Connection test SUCCESS — authenticated');
  testImap.end();
  process.exit(0);
});

testImap.once('error', (err) => {
  console.log('❌ Connection test FAILED:', err.message);
  process.exit(1);
});

testImap.once('end', () => {
  console.log('Connection closed');
});

console.log('Attempting to connect...');
testImap.connect();

setTimeout(() => {
  console.log('❌ Connection timeout — no response after 10 seconds');
  process.exit(1);
}, 10000);
