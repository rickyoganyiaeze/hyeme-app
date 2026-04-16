const { generateRandomOTP } = require('../utils/helpers');

// In production, integrate Twilio, Vonage, or AWS SNS here
const sendOTP = async (phone) => {
    const otp = generateRandomOTP();
    console.log(`[Mock OTP Service] Sending OTP ${otp} to ${phone}`);
    
    return { success: true, mockOtp: otp };
};

// FIXED: Order is now (userInputOtp, generatedOtp)
const verifyOTP = async (userInputOtp, generatedOtp) => {
    if (userInputOtp === generatedOtp) {
        return { success: true };
    }
    return { success: false, message: 'Invalid OTP' };
};

module.exports = { sendOTP, verifyOTP };