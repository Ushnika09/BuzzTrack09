// server/src/server.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { startDataCollection } from './services/dataCollector.js';

dotenv.config();

// console.log('   PORT:', process.env.PORT);
// console.log('   NEWS_API_KEY:', process.env.NEWS_API_KEY ? `Set (${process.env.NEWS_API_KEY.substring(0, 8)}...)` : 'MISSING');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active connections
global.io = io;
global.activeSubscriptions = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe', (data) => {
    const { brand } = data;
    console.log(`Client ${socket.id} subscribed to brand: ${brand}`);
    
    if (!global.activeSubscriptions.has(brand)) {
      global.activeSubscriptions.set(brand, new Set());
    }
    global.activeSubscriptions.get(brand).add(socket.id);
    
    socket.join(brand);
  });

  socket.on('unsubscribe', (data) => {
    const { brand } = data;
    if (global.activeSubscriptions.has(brand)) {
      global.activeSubscriptions.get(brand).delete(socket.id);
    }
    socket.leave(brand);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Clean up subscriptions
    global.activeSubscriptions.forEach((sockets, brand) => {
      sockets.delete(socket.id);
    });
  });
});

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  // console.log(`🚀 BuzzTrack server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  
  // Start data collection after server starts
  startDataCollection();
});