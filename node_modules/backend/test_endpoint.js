
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find officer to get token
  const officer = await User.findOne({ role: 'officer' });
  if (!officer) return console.log("No officer found");
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: officer._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  const res = await fetch('http://localhost:5000/api/ai/officer-summary', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  console.log("Response:", data);
  
  await mongoose.disconnect();
}

run();
