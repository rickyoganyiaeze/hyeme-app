const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

// ADDED: Configure dotenv immediately
require('dotenv').config(); 

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const errorHandler = require('./middleware/error.middleware');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');
const groupRoutes = require('./routes/group.routes');
const exploreRoutes = require('./routes/explore.routes');
const settingsRoutes = require('./routes/settings.routes');

// Initialize Express
const app = express();
const server = http.createServer(app);

// ============================================================
// SOCKET.IO INITIALIZATION
// ============================================================
console.log('🔌 Initializing Socket.IO...');
let io;
try {
    const socketConfig = require('./config/socket');
    io = socketConfig.initSocket(server);
    console.log('✅ Socket.IO initialized successfully');
} catch (err) {
    console.error('❌ Failed to initialize Socket.IO:', err.message);
}

// ============================================================
// MIDDLEWARE
// ============================================================
console.log('⚙️  Setting up middleware...');

// CORS - FIX: Added your hosted URL to the allowed list
app.use(cors({
    origin: [
        'http://localhost:5000', 
        'http://127.0.0.1:5000', 
        'http://127.0.0.1:5500', 
        'http://localhost:5500',
        'https://hyeme-app.onrender.com' // <--- ADDED THIS FOR HOSTING
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
});

// ============================================================
// STATIC FILES SERVING
// ============================================================
console.log('📁 Setting up static file serving...');

// Serve the 'frontend' folder so the browser can access index.html, css, js, etc.
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve User uploaded media (images/videos)
app.use('/storage', express.static(path.join(__dirname, '../storage')));

// Make /storage path available globally for multer uploads
global.__basedir = __dirname;

// ============================================================
// API ROUTES
// ============================================================
console.log('🛤️  Setting up API routes...');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        message: '✅ HyeMe Server is running',
        time: new Date().toISOString(),
        socketIO: io ? 'active' : 'inactive'
    });
});

// ============================================================
// FALLBACK ROUTE FOR SPA/CLIENT-SIDE ROUTING
// ============================================================
app.get('*', (req, res) => {
    // Exclude API routes from this fallback
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ 
            error: 'API Route not found',
            message: `Cannot find ${req.method} ${req.originalUrl}`
        });
    }
    
    // FIX: Serve index.html for ALL other requests
    // This allows the frontend router to work on refresh
    const indexPath = path.join(__dirname, '../frontend/index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('❌ Error serving index.html:', err);
            res.status(500).json({ 
                error: 'Internal Server Error',
                message: 'Failed to load application'
            });
        }
    });
});

// ============================================================
// ERROR HANDLING (Must be last)
// ============================================================
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        console.log('\n🔗 Connecting to MongoDB...');
        await connectDB();
        console.log('✅ MongoDB connected successfully\n');
        
        // Start HTTP server
        server.listen(PORT, '0.0.0.0', () => {
            console.log('\n========================================');
            console.log('  🚀 HYEME SERVER IS RUNNING');
            console.log(`  📍 Local:   http://localhost:${PORT}`);
            console.log(`  📍 Network: http://0.0.0.0:${PORT}`);
            console.log(`  🔗 API:     http://localhost:${PORT}/api`);
            console.log('========================================\n');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1); 
    }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});