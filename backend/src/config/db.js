const mongoose = require('mongoose');
const https = require('https');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n================ MONGODB CONNECTION ERROR ================`);
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('whitelisted')) {
      https.get('https://api.ipify.org', (res) => {
        let ip = '';
        res.on('data', d => ip += d);
        res.on('end', () => {
          console.error(`\n🚨 ACTION REQUIRED: Your current Public IP is: ${ip}`);
          console.error(`Please go to MongoDB Atlas -> Security -> Network Access and add ${ip} to your IP Access List.`);
          console.error(`Alternatively, add 0.0.0.0/0 to temporarily allow all connections for the duration of the hackathon.`);
          console.error(`==========================================================\n`);
          process.exit(1);
        });
      }).on('error', () => process.exit(1));
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
