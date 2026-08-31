const User = require('../models/User');
const Complaint = require('../models/Complaint');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const bcrypt = require('bcryptjs');

// Generate an 8-character random alphanumeric password
const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const totalCitizens = await User.countDocuments({ role: 'citizen' });
    const activeOfficers = await User.countDocuments({ role: 'officer', status: 'active' });
    const inactiveOfficers = await User.countDocuments({ role: 'officer', status: 'inactive' });
    
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const criticalComplaints = await Complaint.countDocuments({ priority: 'CRITICAL' });

    res.status(200).json({
      success: true,
      stats: {
        totalCitizens,
        activeOfficers,
        inactiveOfficers,
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        criticalComplaints
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all officers
// @route   GET /api/admin/officers
// @access  Private (Admin)
const getOfficers = async (req, res) => {
  try {
    const officers = await User.find({ role: 'officer' }).select('-password').sort('-createdAt');
    res.status(200).json({ success: true, officers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new officer
// @route   POST /api/admin/officers
// @access  Private (Admin)
const createOfficer = async (req, res) => {
  try {
    const { name, email, department, designation, employeeId, assignedArea, password } = req.body;

    // Check if email is already in use
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Initial password is required' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const officer = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'officer',
      department,
      designation,
      employeeId,
      assignedArea,
      status: 'active',
      mustChangePassword: true
    });

    res.status(201).json({
      success: true,
      officer: {
        _id: officer._id,
        name: officer.name,
        email: officer.email,
        department: officer.department,
        designation: officer.designation,
        employeeId: officer.employeeId,
        assignedArea: officer.assignedArea,
        status: officer.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update officer details or status
// @route   PATCH /api/admin/officers/:id
// @access  Private (Admin)
const updateOfficer = async (req, res) => {
  try {
    const { status } = req.body; // allow other updates later if needed
    const officer = await User.findOne({ _id: req.params.id, role: 'officer' });
    
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer not found' });
    }

    if (status) officer.status = status;
    
    await officer.save();

    res.status(200).json({
      success: true,
      officer: {
        _id: officer._id,
        name: officer.name,
        email: officer.email,
        status: officer.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset an officer's access (generate new temp password)
// @route   POST /api/admin/officers/:id/reset-access
// @access  Private (Admin)
const resetOfficerAccess = async (req, res) => {
  try {
    const officer = await User.findOne({ _id: req.params.id, role: 'officer' });
    
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer not found' });
    }

    const tempPassword = generateTempPassword();
    const salt = await bcrypt.genSalt(10);
    officer.password = await bcrypt.hash(tempPassword, salt);
    officer.mustChangePassword = true;
    
    await officer.save();

    res.status(200).json({
      success: true,
      message: 'Access reset successfully',
      temporaryPassword: tempPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an officer
// @route   DELETE /api/admin/officers/:id
// @access  Private (Admin)
const deleteOfficer = async (req, res) => {
  try {
    const officer = await User.findOne({ _id: req.params.id, role: 'officer' });
    
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer not found' });
    }

    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Officer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all password reset requests
// @route   GET /api/admin/reset-requests
// @access  Private (Admin)
const getResetRequests = async (req, res) => {
  try {
    const requests = await PasswordResetRequest.find()
      .populate('officer', 'name email')
      .sort('-createdAt');
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve a password reset request
// @route   PATCH /api/admin/reset-requests/:id/approve
// @access  Private (Admin)
const approveReset = async (req, res) => {
  try {
    const request = await PasswordResetRequest.findById(req.params.id);
    
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Pending request not found' });
    }

    const resetToken = generateTempPassword(); // re-use 8-char secure random generator
    const salt = await bcrypt.genSalt(10);
    request.resetTokenHash = await bcrypt.hash(resetToken, salt);
    
    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = req.user._id;
    
    // Expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    request.expiresAt = expiresAt;

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request approved successfully',
      resetToken // Returned ONLY once here
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a password reset request
// @route   PATCH /api/admin/reset-requests/:id/reject
// @access  Private (Admin)
const rejectReset = async (req, res) => {
  try {
    const request = await PasswordResetRequest.findById(req.params.id);
    
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Pending request not found' });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request rejected successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
  getOfficers,
  createOfficer,
  updateOfficer,
  resetOfficerAccess,
  deleteOfficer,
  getResetRequests,
  approveReset,
  rejectReset
};
