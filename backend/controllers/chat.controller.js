const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User'); 
const { emitMessage, updateMessageStatus } = require('../services/socket.service');

exports.getMyChats = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const chats = await Chat.find({ participants: { $in: [myId] } })
            .populate('participants', 'name avatar lastSeen isOnline') 
            .populate('lastMessage.sender', 'name')
            .sort({ updatedAt: -1 });
        
        const chatsWithCounts = await Promise.all(chats.map(async (chat) => {
            const unreadCount = await Message.countDocuments({
                chatId: chat._id,
                sender: { $ne: myId }, 
                status: { $ne: 'white' } 
            });
            
            const chatObj = chat.toObject();
            chatObj.unreadCount = unreadCount;
            return chatObj;
        }));
            
        res.status(200).json(chatsWithCounts);
    } catch (error) { next(error); }
};

exports.createOrGetChat = async (req, res, next) => {
    try {
        const { participantId } = req.body;
        
        let chat = await Chat.findOne({
            isGroupChat: false,
            $and: [
                { participants: { $in: [req.user._id] } },
                { participants: { $in: [participantId] } }
            ]
        }).populate('participants', 'name avatar lastSeen isOnline');

        if (chat) return res.status(200).json(chat);

        chat = await Chat.create({
            participants: [req.user._id, participantId]
        });
        
        const populatedChat = await chat.populate('participants', 'name avatar lastSeen isOnline');
        res.status(201).json(populatedChat);
    } catch (error) { next(error); }
};

exports.getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId })
            .populate('sender', 'name avatar')
            .sort({ createdAt: 1 });
            
        res.status(200).json(messages);
    } catch (error) { next(error); }
};

exports.sendMessage = async (req, res, next) => {
    try {
        const { content, type, replyTo } = req.body;
        const chatId = req.params.chatId;
        
        let messageData = {
            chatId,
            sender: req.user._id,
            content: content || '',
            type: type || 'text',
            status: 'grey'
        };

        if (replyTo) messageData.replyTo = replyTo;
        
        const message = await Message.create(messageData);

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: { content: message.content, sender: req.user._id },
            updatedAt: Date.now() 
        });

        const populatedMsg = await message.populate('sender', 'name avatar');
        emitMessage(chatId, populatedMsg);

        res.status(201).json(message);
    } catch (error) { next(error); }
};

exports.markMessagesAsRead = async (req, res, next) => {
    try {
        const { chatId } = req.body;
        const myId = req.user._id;

        const result = await Message.updateMany(
            { chatId: chatId, sender: { $ne: myId }, status: { $ne: 'white' } },
            { status: 'white' }
        );

        updateMessageStatus(chatId, null, 'white'); 

        res.status(200).json({ message: 'Messages marked as read', count: result.modifiedCount });
    } catch (error) { next(error); }
};

exports.updateMessageStatus = async (req, res, next) => {
    try {
        const { status } = req.body; 
        const messageId = req.params.messageId;
        if (!['grey', 'white'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        if (status === 'white' && message.sender.toString() !== req.user._id.toString()) {
            message.status = 'white';
            await message.save();
            updateMessageStatus(message.chatId, messageId, 'white');
            return res.status(200).json({ message: 'Status updated to seen' });
        }
        res.status(200).json(message);
    } catch (error) { next(error); }
};

// FIX: Replaced deprecated message.remove() with Message.findByIdAndDelete()
exports.deleteMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete' });
        }
        await Message.findByIdAndDelete(req.params.messageId);
        res.status(200).json({ message: 'Message deleted' });
    } catch (error) { next(error); }
};
