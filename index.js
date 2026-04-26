const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alerts');
const resourceRoutes = require('./routes/resources');
const adminToolsRoutes = require('./routes/admin_tools');
const collaborationRoutes = require('./routes/collaboration');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

global.io = io;

// Production Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Required for some local assets
}));
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for development/testing, lower for strict prod
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin-tools', adminToolsRoutes);
app.use('/api/collaboration', collaborationRoutes);

// Root Health Check
app.get('/', (req, res) => {
  res.send('<h1>🚀 SafeCity API is LIVE</h1><p>Status: Healthy</p>');
});




io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/safecity_db';

// Optimized Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Exit if it's a critical initial connection failure
    // process.exit(1); 
  }
};

const PORT = process.env.PORT || 5000;

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is officially live on port ${PORT}`);
  connectDB();
});

// Global Error Handlers for Stability
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

