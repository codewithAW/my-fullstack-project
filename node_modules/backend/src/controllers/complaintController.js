const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { Parser } = require('json2csv');

// @desc    Create a complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, area } = req.body;
    let imageUrl = req.body.imageUrl || '';
    
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }

    // Check for duplicate or similar complaints
    // Simple logic: same category, same area, status is Pending or In Progress
    const duplicate = await Complaint.findOne({
      category,
      area,
      status: { $in: ['Pending', 'In Progress'] }
    });

    // If duplicate found and user didn't explicitly confirm, return a warning
    if (duplicate && !req.body.confirmDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'Similar issue already reported nearby.',
        existingComplaint: duplicate
      });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      area,
      imageUrl,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Public
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my complaints
// @route   GET /api/complaints/my
// @access  Private (Citizen)
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id })
      .sort('-createdAt');
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Public
const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upvote complaint
// @route   PUT /api/complaints/:id/upvote
// @access  Private (Citizen)
const upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check if user already upvoted
    const hasUpvoted = complaint.upvotedBy.some(id => id.toString() === req.user._id.toString());
    
    if (hasUpvoted) {
      // Remove upvote (toggle)
      complaint.upvotedBy = complaint.upvotedBy.filter(id => id.toString() !== req.user._id.toString());
      complaint.upvotes = Math.max(0, complaint.upvotes - 1);
    } else {
      // Add upvote
      complaint.upvotedBy.push(req.user._id);
      complaint.upvotes += 1;
    }

    // Update Priority Score
    // Score = upvotes × 2 + daysSinceCreated
    const daysSinceCreated = Math.floor((new Date() - complaint.createdAt) / (1000 * 60 * 60 * 24));
    complaint.priorityScore = (complaint.upvotes * 2) + daysSinceCreated;

    if (complaint.priorityScore < 5) complaint.priority = 'LOW';
    else if (complaint.priorityScore <= 15) complaint.priority = 'MEDIUM';
    else if (complaint.priorityScore <= 30) complaint.priority = 'HIGH';
    else complaint.priority = 'CRITICAL';

    await complaint.save();
    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Officer)
const updateStatus = async (req, res) => {
  try {
    const { status, officerRemark } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    console.log('UpdateStatus - Incoming status:', status, 'Current status:', complaint.status);
    if (status === 'Resolved' && complaint.status !== 'Resolved') {
      console.log('Condition met! Setting feedbackPending to true');
      complaint.feedbackPending = true;
    }

    if (status) complaint.status = status;
    if (officerRemark !== undefined) complaint.officerRemark = officerRemark;

    await complaint.save();
    console.log('After save - feedbackPending:', complaint.feedbackPending);
    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Provide feedback on resolved complaint
// @route   PUT /api/complaints/:id/feedback
// @access  Private (Citizen)
const addFeedback = async (req, res) => {
  try {
    const { feedbackRating, feedbackComment } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to leave feedback' });
    }

    if (!complaint.feedbackPending) {
      return res.status(400).json({ success: false, message: 'Feedback not pending' });
    }

    complaint.feedbackRating = feedbackRating;
    complaint.feedbackComment = feedbackComment;
    complaint.feedbackGiven = true;
    complaint.feedbackPending = false;

    await complaint.save();
    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export complaints as CSV
// @route   GET /api/complaints/export
// @access  Private (Officer)
const exportComplaints = async (req, res) => {
  try {
    const { category, status, area, search, priority } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (area) query.area = { $regex: area, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query).populate('createdBy', 'name').sort('-createdAt');
    
    const formattedComplaints = complaints.map(c => ({
      ID: c._id.toString(),
      Title: c.title,
      Category: c.category,
      Area: c.area,
      Status: c.status,
      Priority: c.priority,
      Upvotes: c.upvotes,
      'Filed By': c.createdBy ? c.createdBy.name : 'Unknown',
      'Filed On': c.createdAt.toISOString(),
      'Last Updated': c.updatedAt.toISOString(),
      'Officer Remark': c.officerRemark || ''
    }));

    if (formattedComplaints.length === 0) {
      formattedComplaints.push({
        ID: '', Title: 'No complaints matched the current filters', Category: '', Area: '', Status: '', Priority: '', Upvotes: '', 'Filed By': '', 'Filed On': '', 'Last Updated': '', 'Officer Remark': ''
      });
    }

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(formattedComplaints);

    res.header('Content-Type', 'text/csv');
    res.attachment(`complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaint,
  upvoteComplaint,
  updateStatus,
  addFeedback,
  exportComplaints
};
