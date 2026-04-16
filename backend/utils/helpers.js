const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

const generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { formatTime, generateRandomOTP };