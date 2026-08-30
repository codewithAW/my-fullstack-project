const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Road', 'Garbage', 'Water', 'Electricity', 'Other']
    },
    area: {
      type: String,
      required: [true, 'Please specify the area/locality'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending'
    },
    upvotes: {
      type: Number,
      default: 0
    },
    upvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    imageUrl: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    officerRemark: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW'
    },
    priorityScore: {
      type: Number,
      default: 0
    },
    feedbackRating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedbackComment: {
      type: String,
      default: ''
    },
    feedbackGiven: {
      type: Boolean,
      default: false
    },
    feedbackPending: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
