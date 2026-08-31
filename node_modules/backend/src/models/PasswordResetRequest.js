const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema(
  {
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    officerEmail: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'rejected', 'expired'],
      default: 'pending'
    },
    resetTokenHash: {
      type: String
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
