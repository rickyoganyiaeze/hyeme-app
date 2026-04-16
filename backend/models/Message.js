const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Chat', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: { 
        type: String, 
        trim: true 
    },
    type: { 
        type: String, 
        enum: ['text', 'image', 'video', 'file', 'speech', 'contact'], 
        default: 'text' 
    },
    replyTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Message' 
    },
    reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String
    }],
    
    // CUSTOM HYEME STATUS
    // black = Not delivered (offline/db error)
    // grey = Delivered (reached server/recipient device)
    // white = Seen (recipient opened chat)
    status: { 
        type: String, 
        enum: ['black', 'grey', 'white'], 
        default: 'black' 
    }

}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);