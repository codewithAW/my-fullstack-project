const connectDB = require('../src/config/db');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@civic.gov';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    await connectDB();
    console.log('Database Connected...');

    // Check if admin exists
    const adminExists = await User.findOne({ email: adminEmail });
    if (adminExists) {
      console.log('Admin already exists.');
      process.exit();
    }

    // Check if ANY admin exists
    const anyAdminExists = await User.findOne({ role: 'admin' });
    if (anyAdminExists) {
      console.log('An admin account already exists in the system.');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });

    console.log('Admin user created successfully.');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
