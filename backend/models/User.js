const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    name: { 
        type: String, 
        default: 'HyeMe User',
        trim: true
    },
    about: { 
        type: String, 
        default: 'Hey there! I am using HyeMe.', 
        maxlength: 150 
    },
    avatar: { 
        type: String, 
        default: '' 
    },
    isOnboarded: { 
        type: Boolean, 
        default: false 
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    // NEW: Language Support
    preferredLanguage: {
        type: String,
        enum: ['en', 'es', 'fr', 'de', 'ar'],
        default: 'en'
    },
    friends: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    friendRequests: [{
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
        createdAt: { type: Date, default: Date.now }
    }],
    settings: {
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        chatBg: { type: String, default: 'default' }
    },
    privacy: {
        statusVisibility: { type: String, enum: ['everyone', 'friends', 'contacts'], default: 'everyone' },
        anonymousMode: { type: Boolean, default: false },
        whoCanAddMe: { type: String, enum: ['everyone', 'contacts'], default: 'everyone' }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);