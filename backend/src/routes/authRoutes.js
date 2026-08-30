const express = require('express');
const { signup, login, getMe, changePassword, googleLogin, requestReset, checkResetStatus, resetPasswordWithToken, verifyEmail, resendVerification } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

// Officer Reset Flow
router.post('/officer/request-reset', requestReset);
router.get('/officer/reset-status/:email', checkResetStatus);
router.post('/officer/reset-password', resetPasswordWithToken);

module.exports = router;
