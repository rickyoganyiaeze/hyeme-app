const rateLimit = require('express-rate-limit');

// Limit OTP requests to prevent spam/brute force
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 OTP requests per windowMs
    message: 'Too many OTP requests, please try again after 15 minutes.'
});

// General API limiter
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100 // 100 requests per minute
});

module.exports = { otpLimiter, apiLimiter };