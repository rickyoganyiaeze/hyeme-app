const jwt = require('jsonwebtoken');

// FIX: Read from .env, fallback to hardcoded for local dev
const JWT_SECRET = process.env.JWT_SECRET || 'hyeme_super_secret_jwt_key_2024_change_in_production';

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: '30d', 
    });
};

module.exports = generateToken;