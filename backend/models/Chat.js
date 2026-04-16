const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    isGroupChat: { 
        type: Boolean, 
        default: false 
    },
    groupName: { 
        type: String, 
        trim: true 
    },
    groupAvatar: { 
        type: String, 
        default: '' 
    },
    lastMessage: {
        content: { type: String, trim: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        time: { type: Date, default: Date.now }
    }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);