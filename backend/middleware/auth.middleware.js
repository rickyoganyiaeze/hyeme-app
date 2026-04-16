const jwt = require('jsonwebtoken');

// FIX: Read from .env
const JWT_SECRET = process.env.JWT_SECRET || 'hyeme_super_secret_jwt_key_2024_change_in_production';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            
            const User = require('../models/User');
            req.user = await User.findById(decoded.id).select('-__v');
            next();
        } catch (error) {
            console.error("Auth error:", error.message);
            // FIX: Added 'return' to prevent server crash
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        // FIX: Added 'return' to prevent server crash
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = protect;