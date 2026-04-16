const { Server } = require('socket.io');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

let io;
let onlineUsers = new Map();

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        // FIX: Added your hosted URL to Socket CORS
        cors: { 
            origin: [
                'http://localhost:5000', 
                'http://127.0.0.1:5000', 
                'http://127.0.0.1:5500', 
                'http://localhost:5500',
                'https://hyeme-app.onrender.com' // <--- ADDED THIS FOR HOSTING
            ],
            methods: ["GET", "POST"],
            credentials: true 
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
        allowEIO3: true
    });

    io.on('connection', (socket) => {
        console.log(`🔌 New Socket Connection: ${socket.id}`);

        socket.on('joinPersonalRoom', async (userId) => {
            if (!userId) return;
            
            // FIX: Clean up old room if user reconnects (Prevents Ghosts)
            if (socket.userId) {
                socket.leave(socket.userId.toString());
            }

            socket.userId = userId;
            socket.join(userId.toString());
            onlineUsers.set(userId.toString(), socket.id);
            
            console.log(`👤 User ${userId} joined personal room`);
            
            try {
                // FORCE DB UPDATE: Mark Online
                await User.findByIdAndUpdate(userId, { 
                    isOnline: true, 
                    lastSeen: new Date() 
                });
                
                // BROADCAST: Tell everyone this user is ONLINE
                socket.broadcast.emit('userStatus', { 
                    userId, 
                    status: 'online' 
                });
                
            } catch (err) {
                console.error("Error joining room:", err);
            }
        });

        socket.on('sendMessage', async (data) => {
            try {
                const { senderId, recipientId, content, senderName, recipientName } = data;

                // 1. VALIDATION
                const senderUser = await User.findById(senderId);
                const recipientUser = await User.findById(recipientId);

                if (!recipientUser || !recipientUser.friends.includes(senderId) || !senderUser.friends.includes(recipientId)) {
                    console.log("❌ BLOCKED: Users are no longer connected.");
                    return io.to(senderId.toString()).emit('connectionLost', { 
                        recipientId,
                        message: `You are no longer connected with ${recipientName || 'user'}.`
                    });
                }

                // 2. FIND OR CREATE CHAT
                let chat = await Chat.findOne({
                    isGroupChat: false,
                    participants: { $all: [senderId, recipientId] }
                });

                if (!chat) {
                    chat = await Chat.create({
                        participants: [senderId, recipientId],
                        updatedAt: new Date()
                    });
                }

                // 3. SAVE MESSAGE
                const message = await Message.create({
                    chatId: chat._id,
                    sender: senderId,
                    content: content || '',
                    status: 'grey' 
                });

                // 4. UPDATE CHAT
                await Chat.findByIdAndUpdate(chat._id, {
                    lastMessage: { content: message.content, sender: senderId, time: new Date() },
                    updatedAt: new Date()
                });

                // 5. PAYLOAD
                const payload = {
                    _id: message._id,
                    chatId: chat._id,
                    senderId,
                    senderName,
                    content: message.content,
                    status: 'grey',
                    createdAt: message.createdAt
                };

                // 6. EMIT
                io.to(recipientId.toString()).emit('receiveMessage', payload);
                io.to(senderId.toString()).emit('messageSent', { ...payload, recipientId, recipientName });

            } catch (err) {
                console.error("❌ Error sending message:", err);
            }
        });

        socket.on('markMessagesAsRead', async (data) => {
            try {
                const { chatId, senderId } = data; 
                const myId = socket.userId;

                const result = await Message.updateMany(
                    { chatId: chatId, sender: senderId, status: { $ne: 'white' } },
                    { status: 'white' }
                );

                if (senderId) {
                    io.to(senderId.toString()).emit('messageStatus', { 
                        status: 'white', 
                        chatId: chatId.toString() 
                    });
                }

            } catch (err) {
                console.error("Error marking read:", err);
            }
        });

        socket.on('disconnect', async (reason) => {
            const userId = socket.userId;
            if (userId) {
                onlineUsers.delete(userId.toString());
                
                try {
                    // FORCE DB UPDATE: Mark Offline
                    await User.findByIdAndUpdate(userId, { 
                        isOnline: false, 
                        lastSeen: new Date() 
                    });
                    
                    console.log(`⚠️ User ${userId} disconnected.`);
                    
                    // BROADCAST: Tell EVERYONE this user is OFFLINE
                    io.emit('userStatus', { 
                        userId, 
                        status: 'offline', 
                        lastSeen: new Date() 
                    });
                    
                } catch (err) {
                    console.error("Error updating offline status:", err);
                }
            }
        });
    });

    return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };