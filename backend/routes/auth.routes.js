const express = require('express');
const router = express.Router();
const { otpLimiter } = require('../middleware/rateLimit.middleware');
const authController = require('../controllers/auth.controller');

router.post('/send-otp', otpLimiter, authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;