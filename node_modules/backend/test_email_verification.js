const http = require('http');

const data = JSON.stringify({
  name: 'Test Citizen',
  email: `test_citizen_${Date.now()}@example.com`,
  password: 'Password123!',
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', responseData);
    
    try {
      const parsed = JSON.parse(responseData);
      if (parsed.requiresVerification) {
        console.log('✅ Signup flow successfully intercepted for verification!');
      } else {
        console.log('❌ Failed: Did not require verification');
      }
    } catch (e) {
      console.log('Failed to parse response JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
