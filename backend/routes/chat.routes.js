const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');
const upload = require('../services/media.service');

router.get('/', protect, chatController.getMyChats);
router.post('/create', protect, chatController.createOrGetChat);
router.get('/:chatId/messages', protect, chatController.getMessages);
router.post('/:chatId/send', protect, upload.single('media'), chatController.sendMessage);
router.put('/read-status', protect, chatController.markMessagesAsRead); // NEW ROUTE
router.put('/:messageId/status', protect, chatController.updateMessageStatus);
router.delete('/:messageId', protect, chatController.deleteMessage);

module.exports = router;