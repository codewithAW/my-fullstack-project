const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../backend/src/models/User');
require('dotenv').config({ path: '../backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // 1. Create officer directly via mongoose
  const email = 'test_officer_' + Date.now() + '@city.gov';
  const password = 'securepassword123';
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const officer = await User.create({
    name: 'Test Officer',
    email,
    password: hashedPassword,
    role: 'officer',
    department: 'Test',
    designation: 'Tester',
    employeeId: 'T-100',
    assignedArea: 'Test Area',
    status: 'active',
    mustChangePassword: true
  });
  
  console.log('Officer created:', officer.email);
  
  // 2. Try to login exactly as authController does
  const user = await User.findOne({ email }).select('+password');
  console.log('User found:', !!user);
  
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
