const User = require('../models/User');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendVerificationEmail } = require('../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Helper to generate 6 digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Force citizen role on public signup
    const safeRole = 'citizen';

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    // New user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: safeRole,
      isEmailVerified: true
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Email verification removed

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email code
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email already verified',
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        token: generateToken(user._id)
      });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    // Verify success
    user.isEmailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email successfully verified',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Skip email verification — mark user as verified and issue a JWT
// @route   POST /api/auth/skip-verification
// @access  Public
const skipVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Mark as verified so they can log in normally in future
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.verificationCode = null;
      user.verificationCodeExpires = null;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Continuing without verification',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Cooldown check (prevent resending if code was generated less than 30s ago)
    // verificationCodeExpires is set to 10 mins in future. 
    // If it's > 9 min 30s in future, user must wait.
    if (user.verificationCodeExpires) {
      const msLeft = user.verificationCodeExpires.getTime() - Date.now();
      const tenMins = 10 * 60 * 1000;
      const msSinceLastCode = tenMins - msLeft;
      if (msSinceLastCode < 30000) {
        return res.status(429).json({ success: false, message: 'Please wait before requesting a new code' });
      }
    }

    const code = generateVerificationCode();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailSent = await sendVerificationEmail(user.email, code);
    if (!emailSent) {
      return res.status(500).json({ success: false, message: "We couldn't send the verification email. Please try again." });
    }

    res.status(200).json({ success: true, message: 'Verification code sent' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
    
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google login / signup for citizens
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { credential, action } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (action === 'login') {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "We couldn't find a registered account associated with this Google account. Please register first."
        });
      }
      
      if (user.role !== 'citizen') {
        return res.status(403).json({ 
          success: false, 
          message: 'Google sign-in is available for citizen accounts only. Please use your assigned officer credentials.' 
        });
      }

      if (!user.googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true; // Auto verify since Google did it
        await user.save();
      }
    } else if (action === 'signup') {
      if (user) {
        return res.status(409).json({
          success: false,
          message: 'An account already exists with this Google account. Please sign in.'
        });
      }

      user = await User.create({
        name,
        email,
        googleId,
        role: 'citizen',
        isEmailVerified: true // Auto verify since Google verified
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action specified.' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Google authentication failed: ' + error.message });
  }
};

// @desc    Request a password reset for officer
// @route   POST /api/auth/officer/request-reset
// @access  Public
const requestReset = async (req, res) => {
  try {
    const { email } = req.body;
    const officer = await User.findOne({ email, role: 'officer' });
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer account not found.' });
    }

    const existingReq = await PasswordResetRequest.findOne({ 
      officer: officer._id, 
      status: { $in: ['pending', 'approved'] } 
    });

    if (existingReq) {
      return res.status(400).json({ 
        success: false, 
        message: 'A reset request is already active for this account.',
        status: existingReq.status 
      });
    }

    await PasswordResetRequest.create({
      officer: officer._id,
      officerEmail: officer.email,
      status: 'pending'
    });

    res.status(200).json({ success: true, message: 'Reset request submitted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check reset request status
// @route   GET /api/auth/officer/reset-status/:email
// @access  Public
const checkResetStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const request = await PasswordResetRequest.findOne({ officerEmail: email }).sort('-createdAt');

    if (!request) {
      return res.status(404).json({ success: false, message: 'No reset requests found.' });
    }

    if (request.status === 'approved' && request.expiresAt < new Date()) {
      request.status = 'expired';
      await request.save();
    }

    res.status(200).json({ success: true, status: request.status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password with admin token
// @route   POST /api/auth/officer/reset-password
// @access  Public
const resetPasswordWithToken = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    
    const request = await PasswordResetRequest.findOne({ 
      officerEmail: email,
      status: 'approved'
    }).sort('-createdAt');

    if (!request) {
      return res.status(400).json({ success: false, message: 'No approved reset request found.' });
    }

    if (request.expiresAt < new Date()) {
      request.status = 'expired';
      await request.save();
      return res.status(400).json({ success: false, message: 'Reset authorization has expired.' });
    }

    const isMatch = await bcrypt.compare(resetToken, request.resetTokenHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid reset token.' });
    }

    const officer = await User.findById(request.officer);
    const salt = await bcrypt.genSalt(10);
    officer.password = await bcrypt.hash(newPassword, salt);
    officer.mustChangePassword = false;
    await officer.save();

    request.status = 'completed';
    await request.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  signup,
  login,
  verifyEmail,
  skipVerification,
  resendVerification,
  getMe,
  changePassword,
  googleLogin,
  requestReset,
  checkResetStatus,
  resetPasswordWithToken
};
