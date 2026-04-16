const twilio = require('twilio');
const { generateRandomOTP } = require('../utils/helpers');

// Initialize Twilio Client
// We use variables from .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Check if Twilio credentials exist
const isTwilioConfigured = accountSid && authToken && twilioPhone;

let client = null;
if (isTwilioConfigured) {
    client = twilio(accountSid, authToken);
    console.log('✅ Twilio SMS Service Initialized');
} else {
    console.warn('⚠️ Twilio credentials missing. SMS will only work in MOCK mode (Check server logs).');
}

const sendOTP = async (phone) => {
    const otp = generateRandomOTP();

    // IF Twilio is configured -> SEND REAL SMS
    if (isTwilioConfigured && client) {
        try {
            await client.messages.create({
                body: `Your HyeMe verification code is: ${otp}`,
                from: twilioPhone,
                to: phone
            });
            console.log(`📱 REAL SMS sent to ${phone}`);
            return { success: true, mockOtp: otp };
        } catch (error) {
            console.error(`❌ Twilio Error sending to ${phone}:`, error.message);
            // Fallback to mock if sending fails (e.g., unverified number in trial)
            return { success: false, mockOtp: otp, error: error.message };
        }
    } 
    
    // ELSE -> FALLBACK TO MOCK MODE (For local development)
    else {
        console.log(`\n=========================================`);
        console.log(`[MOCK MODE] OTP for ${phone}: ${otp}`);
        console.log(`=========================================\n`);
        return { success: true, mockOtp: otp };
    }
};

const verifyOTP = async (userInputOtp, generatedOtp) => {
    if (userInputOtp === generatedOtp) {
        return { success: true };
    }
    return { success: false, message: 'Invalid OTP' };
};

module.exports = { sendOTP, verifyOTP };