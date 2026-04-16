const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: { 
        type: String, 
        default: '' 
    },
    mediaUrl: { 
        type: String, 
        default: '' 
    },
    type: { 
        type: String, 
        enum: ['text', 'image', 'video'], 
        default: 'text' 
    },
    backgroundColor: { 
        type: String, 
        default: '#7C3AED' // Purple default
    },
    isAnonymous: { 
        type: Boolean, 
        default: false 
    },
    visibility: { 
        type: String, 
        enum: ['everyone', 'friends', 'contacts'], 
        default: 'everyone' 
    },
    duration: { 
        type: String, 
        enum: ['24h', '7d', '1m'], 
        default: '24h' 
    },
    views: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }]
}, { timestamps: true });

// Auto-delete status after duration (handled via cron job in production)
statusSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // Defaults to 24h deletion

module.exports = mongoose.model('Status', statusSchema);