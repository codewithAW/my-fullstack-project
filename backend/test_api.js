

// Admin credentials (assuming from earlier context or we can create one directly in DB)
// Let's just create an officer directly in DB to bypass admin auth for test, 
// wait, I want to test the full flow to ensure no API boundary issues.

const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Create admin if none exists
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    admin = await User.create({
      name: 'Admin',
      email: 'admin_test@city.gov',
      password: await bcrypt.hash('admin123', salt),
      role: 'admin'
    });
  }
  
  // Login as admin
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: admin.email,
      password: 'admin123'
    })
  }).then(r => r.json());
  
  const token = loginRes.token;
  console.log('Admin token:', token.substring(0, 10) + '...');
  
  // Create officer via API
  const officerEmail = 'officer_api_' + Date.now() + '@city.gov';
  const officerPassword = 'MySecretPassword123';
  
  try {
    const createRes = await fetch('http://localhost:5000/api/admin/officers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'API Officer',
        email: officerEmail,
        department: 'Testing',
        designation: 'Tester',
        employeeId: 'T-999',
        assignedArea: 'Test',
        password: officerPassword
      })
    }).then(r => r.json());
    console.log('Officer created via API:', createRes.success);
  } catch (err) {
    console.error('Failed to create officer:', err.response?.data || err.message);
    return;
  }
  
  // Login as officer via API
  try {
    const officerLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: officerEmail,
        password: officerPassword
      })
    }).then(r => r.json());
    console.log('Officer login via API:', officerLoginRes.success);
  } catch (err) {
    console.error('Failed to login officer:', err.response?.data || err.message);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
