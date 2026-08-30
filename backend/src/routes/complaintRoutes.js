const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaint,
  upvoteComplaint,
  updateStatus,
  addFeedback,
  exportComplaints
} = require('../controllers/complaintController');
const { protect, requireCitizen, requireOfficer } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/export', protect, requireOfficer, exportComplaints);

router.route('/')
  .post(protect, requireCitizen, upload.single('photo'), createComplaint)
  .get(getComplaints);

router.get('/mine', protect, requireCitizen, getMyComplaints);

router.route('/:id')
  .get(getComplaint);

router.patch('/:id/upvote', protect, requireCitizen, upvoteComplaint);
router.patch('/:id/status', protect, requireOfficer, updateStatus);
router.patch('/:id/feedback', protect, requireCitizen, addFeedback);

module.exports = router;
