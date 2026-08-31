const express = require('express');
const router = express.Router();
const { getAIBriefing } = require('../controllers/aiController');
const { protect, requireOfficer } = require('../middleware/authMiddleware');

router.get('/officer-summary', protect, requireOfficer, getAIBriefing);

module.exports = router;
