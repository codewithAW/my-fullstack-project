const mongoose = require('mongoose');
require('dotenv').config();

const Complaint = require('./src/models/Complaint');
const User = require('./src/models/User');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    // Delete all existing complaints to clean up duplicates
    await Complaint.deleteMany({});
    console.log('Cleared existing complaints.');

    // We need a user to attribute complaints to. Find one or create a dummy one.
    let citizen = await User.findOne({ role: 'citizen' });
    if (!citizen) {
      citizen = await User.create({
        name: 'Demo Citizen',
        email: `demo_citizen_${Date.now()}@test.com`,
        password: 'password123',
        role: 'citizen'
      });
    }

    const complaints = [
      {
        title: "Water pipeline leakage near Central Market",
        description: "There is a massive water leak from the main pipeline. Water is accumulating on the street and causing a hazard for pedestrians and vehicles.",
        category: "Water",
        area: "Central Market",
        status: "Pending",
        priority: "HIGH",
        upvotes: 12,
        priorityScore: 24,
        createdBy: citizen._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        title: "Deep pothole on Main Street",
        description: "A huge pothole has formed near the intersection of Main St and 4th Ave. Multiple cars have damaged their tires. Needs urgent repair.",
        category: "Road",
        area: "Downtown",
        status: "In Progress",
        priority: "CRITICAL",
        upvotes: 45,
        priorityScore: 90,
        createdBy: citizen._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Garbage accumulation near residential block",
        description: "Trash has not been collected for over a week near Block C. It is causing a foul smell and attracting pests.",
        category: "Garbage",
        area: "North Hills",
        status: "Pending",
        priority: "MEDIUM",
        upvotes: 5,
        priorityScore: 10,
        createdBy: citizen._id,
        createdAt: new Date()
      },
      {
        title: "Street lights not working",
        description: "The street lights along Elm Street have been out for three days. It is very dark and unsafe to walk at night.",
        category: "Electricity",
        area: "Elm Street",
        status: "Pending",
        priority: "HIGH",
        upvotes: 18,
        priorityScore: 36,
        createdBy: citizen._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Damaged road near school",
        description: "The road leading to the primary school is heavily damaged, making it difficult for school buses to pass.",
        category: "Road",
        area: "Westside",
        status: "Pending",
        priority: "MEDIUM",
        upvotes: 8,
        priorityScore: 16,
        createdBy: citizen._id,
        createdAt: new Date()
      },
      {
        title: "Low water pressure in neighborhood",
        description: "For the past month, the water pressure has been extremely low in all houses on Oak Avenue.",
        category: "Water",
        area: "Oak Avenue",
        status: "Resolved",
        priority: "LOW",
        upvotes: 3,
        priorityScore: 6,
        createdBy: citizen._id,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ];

    await Complaint.insertMany(complaints);
    console.log('Inserted realistic varied complaints.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
