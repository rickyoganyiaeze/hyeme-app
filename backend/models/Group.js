const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    chatId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Chat' 
    },
    name: { 
        type: String, 
        required: true 
    },
    owners: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    permissions: {
        whoCanSendMessages: { type: String, enum: ['all', 'owners'], default: 'all' },
        whoCanAddMembers: { type: String, enum: ['all', 'owners'], default: 'all' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);