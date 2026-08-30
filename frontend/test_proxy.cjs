const http = require('http');
const data = JSON.stringify({ name: 'Proxy Test', email: 'proxy_' + Date.now() + '@test.com', password: 'password123', role: 'citizen' });
const options = {
  hostname: 'localhost',
  port: 5173,
  path: '/api/auth/signup',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};
const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Proxy Test Result:', res.statusCode, body);
    process.exit(0);
  });
});
req.on('error', e => {
  console.error('Proxy Error:', e);
  process.exit(1);
});
req.write(data);
req.end();
