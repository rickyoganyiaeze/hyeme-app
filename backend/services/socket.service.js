const { getIO } = require('../config/socket');

const emitMessage = (chatId, messageData) => {
    const io = getIO();
    if (io) {
        io.to(chatId).emit('receiveMessage', messageData);
    }
};

const emitTyping = (chatId, userId) => {
    const io = getIO();
    if (io) {
        io.to(chatId).emit('displayTyping', { userId, isTyping: true });
    }
};

const updateMessageStatus = (chatId, messageId, status) => {
    const io = getIO();
    if (io) {
        io.to(chatId).emit('messageStatus', { messageId, status });
    }
};

const emitNotification = (userId, eventName, data) => {
    const io = getIO();
    if (io) {
        io.to(userId).emit(eventName, data);
    }
};

module.exports = { emitMessage, emitTyping, updateMessageStatus, emitNotification };