const express = require('express');
const {
  getStats,
  getOfficers,
  createOfficer,
  updateOfficer,
  resetOfficerAccess,
  deleteOfficer,
  getResetRequests,
  approveReset,
  rejectReset
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/stats', getStats);
router.route('/officers')
  .get(getOfficers)
  .post(createOfficer);
  
router.route('/officers/:id')
  .patch(updateOfficer)
  .delete(deleteOfficer);
  
router.post('/officers/:id/reset-access', resetOfficerAccess);

router.get('/reset-requests', getResetRequests);
router.patch('/reset-requests/:id/approve', approveReset);
router.patch('/reset-requests/:id/reject', rejectReset);

module.exports = router;
