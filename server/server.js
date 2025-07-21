const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whiteboard');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💡 To fix this:');
    console.log('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('   2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    console.log('   3. Update MONGODB_URI in server/.env file');
    console.log('🔄 Starting server without database persistence...');
  }
};

connectDB();

// Import routes
const roomRoutes = require('./routes/rooms');

// Routes
app.use('/api/rooms', roomRoutes);

// Serve static files from the React app
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Socket.io connection handling
const socketHandler = require('./socket/socketHandler');
socketHandler(io);

const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
