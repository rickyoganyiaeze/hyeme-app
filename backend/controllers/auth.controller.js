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

        console.log(`\n=========================================`);
        console.log(`[NEW OTP REQUEST] Phone: ${phone}`);
        console.log(`[YOUR MOCK OTP CODE IS: ${result.mockOtp}]`);
        console.log(`=========================================\n`);

        // This sends the exact correct code to the frontend SMS banner
        if (result.mockOtp) {
            return res.status(200).json({ 
                message: 'OTP generated (Dev Mode)', 
                devOtp: result.mockOtp 
            });
        }

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) { next(error); }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        let { phone, otp } = req.body;
        phone = phone.replace(/[^0-9+]/g, '');

        const storedOtp = otpStore[phone];
        
        if (!storedOtp) {
             const existingUser = await User.findOne({ phone });
             if (!existingUser) {
                 return res.status(400).json({ message: 'Please request an OTP first' });
             }
             console.log(`[Recovery Mode] User ${phone} found, allowing login.`);
        } else {
            const result = await verifyOTP(otp, storedOtp);
            if (!result.success) return res.status(400).json({ message: 'Invalid code.' });
            delete otpStore[phone]; 
        }

        let user = await User.findOne({ phone });
        
        if (!user) {
            user = await User.create({ phone });
            const token = generateToken(user._id);
            return res.status(200).json({ token, user, isNewUser: true });
        }

        if (!user.isOnboarded) {
            const token = generateToken(user._id);
            return res.status(200).json({ token, user, isNewUser: true });
        }

        const token = generateToken(user._id);
        res.status(200).json({ token, user, isNewUser: false });
    } catch (error) { next(error); }
};
