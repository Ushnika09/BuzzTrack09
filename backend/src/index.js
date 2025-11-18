// server/src/server.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { startDataCollection } from './services/dataCollector.js';

dotenv.config();

// 1️⃣ DEFINE allowedOrigins FIRST
const allowedOrigins = [
  "http://localhost:5173",
  "https://buzztrack.netlify.app"
];

const app = express();
const server = http.createServer(app);

// 2️⃣ SOCKET.IO (after allowedOrigins)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// 3️⃣ EXPRESS CORS
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Store active connections
global.io = io;
global.activeSubscriptions = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe', ({ brand }) => {
    console.log(`Client ${socket.id} subscribed to: ${brand}`);

    if (!global.activeSubscriptions.has(brand)) {
      global.activeSubscriptions.set(brand, new Set());
    }
    global.activeSubscriptions.get(brand).add(socket.id);
    socket.join(brand);
  });

  socket.on('unsubscribe', ({ brand }) => {
    if (global.activeSubscriptions.has(brand)) {
      global.activeSubscriptions.get(brand).delete(socket.id);
    }
    socket.leave(brand);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    global.activeSubscriptions.forEach((set) => set.delete(socket.id));
  });
});

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  startDataCollection();
});
