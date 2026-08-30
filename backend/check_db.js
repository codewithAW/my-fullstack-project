const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const officers = await User.find({ role: 'officer' }).select('+password');
  console.log('Total officers:', officers.length);
  for (let officer of officers) {
    console.log('Email:', officer.email);
    console.log('Password hash:', officer.password);
  }
  await mongoose.disconnect();
}

run().catch(console.error);
