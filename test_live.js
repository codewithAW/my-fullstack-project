const https = require('https');

const url = 'https://hackathon-project-two-omega.vercel.app/api/complaints';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${data.substring(0, 200)}...`);
  });
}).on('error', (err) => {
  console.log(`Error: ${err.message}`);
});
