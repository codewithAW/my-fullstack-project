const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const email = 'testflow' + Date.now() + '@officer.pk';
  const password = 'mySecurePassword';
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  await User.create({
    name: 'Test Flow',
    email,
    password: hashedPassword,
    role: 'officer'
  });
  
  console.log('Created officer with email:', email, 'and password:', password);
  
  // Now simulate login
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log('User not found!');
  } else {
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Login isMatch:', isMatch);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
