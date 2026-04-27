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
app.get('/', async (req, res) => {
  const dbName = mongoose.connection.name;
  const alertCount = await mongoose.model('Alert').countDocuments({});
  res.send(`
    <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #f8fafc; min-height: 100vh;">
      <h1 style="font-size: 48px; margin-bottom: 8px;">🚀 SafeCity API</h1>
      <p style="color: #64748b; font-size: 20px; font-weight: 600;">Status: Healthy & Online</p>
      <hr style="border: 1px solid #e2e8f0; margin: 40px 0; max-width: 400px; margin-left: auto; margin-right: auto;">
      <div style="display: flex; justify-content: center; gap: 20px;">
        <div style="background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; min-width: 200px;">
          <p style="text-transform: uppercase; font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 2px;">Active Database</p>
          <p style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 8px 0;">${dbName}</p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; min-width: 200px;">
          <p style="text-transform: uppercase; font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 2px;">Incident Pool</p>
          <p style="font-size: 24px; font-weight: 900; color: #dc2626; margin: 8px 0;">${alertCount} Records</p>
        </div>
      </div>
    </div>
  `);
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

