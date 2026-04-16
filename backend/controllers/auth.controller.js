const User = require('../models/User');
const { isValidPhone } = require('../utils/validators');
const { sendOTP, verifyOTP } = require('../services/otp.service');
const generateToken = require('../config/jwt');

let otpStore = {};

exports.sendOTP = async (req, res, next) => {
    try {
        let { phone } = req.body;
        phone = phone.replace(/[^0-9+]/g, '');
        if (!isValidPhone(phone)) return res.status(400).json({ message: 'Invalid phone number' });

        const result = await sendOTP(phone);
        otpStore[phone] = result.mockOtp; 

        // PRODUCTION MODE LOG: Only visible in Render logs, not to the user
        console.log(`\n=========================================`);
        console.log(`[SMS SIMULATION] Phone: ${phone}`);
        console.log(`[HIDDEN OTP CODE: ${result.mockOtp}]`);
        console.log(`=========================================\n`);

        // FIX: Always return a clean message. No devOtp sent to the frontend.
        res.status(200).json({ 
            message: 'Code sent successfully' 
        });
        
    } catch (error) { next(error); }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        let { phone, otp } = req.body;
        phone = phone.replace(/[^0-9+]/g, '');

        const storedOtp = otpStore[phone];
        
        // Handling for Reconnection
        if (!storedOtp) {
             const existingUser = await User.findOne({ phone });
             if (!existingUser) {
                 return res.status(400).json({ message: 'Please request a code first' });
             }
             console.log(`[Recovery Mode] User ${phone} found, allowing login.`);
        } else {
            // Normal Flow: Verify OTP
            const result = await verifyOTP(otp, storedOtp);
            if (!result.success) return res.status(400).json({ message: 'Invalid code.' });
            delete otpStore[phone]; // Clear OTP after use
        }

        let user = await User.findOne({ phone });
        
        // Scenario 1: User does NOT exist -> Create new user
        if (!user) {
            user = await User.create({ phone });
            const token = generateToken(user._id);
            return res.status(200).json({ token, user, isNewUser: true });
        }

        // Scenario 2: User exists but has NOT finished onboarding
        if (!user.isOnboarded) {
            const token = generateToken(user._id);
            return res.status(200).json({ token, user, isNewUser: true });
        }

        // Scenario 3: User exists and IS onboarded -> Login directly
        const token = generateToken(user._id);
        res.status(200).json({ token, user, isNewUser: false });
    } catch (error) { next(error); }
};