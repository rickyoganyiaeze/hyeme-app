// Placeholder for Push Notifications (FCM, APNS)
const sendPushNotification = async (userDeviceToken, payload) => {
    console.log(`[Mock Push] Sending to ${userDeviceToken}:`, payload.title);
    return { success: true };
};

module.exports = { sendPushNotification };