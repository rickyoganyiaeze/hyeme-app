const Status = require('../models/Status');
const User = require('../models/User');

exports.getStatuses = async (req, res, next) => {
    try {
        const statuses = await Status.find({ 
            user: { $ne: req.user._id },
            visibility: { $in: ['everyone'] } 
        })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 });

        res.status(200).json(statuses);
    } catch (error) { next(error); }
};

exports.createStatus = async (req, res, next) => {
    try {
        const { content, type, isAnonymous, visibility, duration, backgroundColor } = req.body;
        
        const mediaUrls = req.files ? req.files.map(f => `/storage/status/${f.filename}`) : [];

        // FIX: Always set user to req.user._id (required field).
        // Use the isAnonymous flag to hide identity on the client side instead.
        const newStatus = await Status.create({
            user: req.user._id,
            content: content || '',
            type: type || 'text',
            mediaUrl: mediaUrls[0] || '',
            isAnonymous: isAnonymous || false,
            visibility: visibility || 'everyone',
            duration: duration || '24h',
            backgroundColor: backgroundColor || '#7C3AED'
        });

        res.status(201).json(newStatus);
    } catch (error) { next(error); }
};
