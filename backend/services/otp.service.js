const { generateRandomOTP } = require('../utils/helpers');

const sendOTP = async (phone) => {
    // GENERATE CODE
    const otp = generateRandomOTP();

    // DEVELOPMENT MODE: RETURN CODE DIRECTLY TO APP
    // This bypasses SMS sending. Perfect for launch testing.
    console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    
    // Return the OTP in the response so frontend can grab it
    return { success: true, mockOtp: otp, devOtp: otp }; 
};

const verifyOTP = async (userInputOtp, generatedOtp) => {
    if (userInputOtp === generatedOtp) {
        return { success: true };
    }
    return { success: false, message: 'Invalid OTP' };
};

module.exports = { sendOTP, verifyOTP };