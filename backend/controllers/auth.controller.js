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

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) { next(error); }
};

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

        // DEV MODE: Send code back to app
        if (result.devOtp) {
            return res.status(200).json({ 
                message: 'OTP generated (Dev Mode)', 
                devOtp: result.devOtp // <--- This sends the code to your app
            });
        }

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) { next(error); }
};