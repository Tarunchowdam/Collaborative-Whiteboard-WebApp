const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Generate a random room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Join or create a room
router.post('/join', async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    // Validate room ID format (alphanumeric, 6-8 characters)
    const roomIdRegex = /^[A-Z0-9]{6,8}$/;
    if (!roomIdRegex.test(roomId.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid room code format' });
    }

    const normalizedRoomId = roomId.toUpperCase();
    
    // Find existing room or create new one
    let room = await Room.findOne({ roomId: normalizedRoomId });
    
    if (!room) {
      room = new Room({
        roomId: normalizedRoomId,
        drawingData: []
      });
      await room.save();
    }

    res.json({
      roomId: room.roomId,
      createdAt: room.createdAt,
      drawingData: room.drawingData
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get room information
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const normalizedRoomId = roomId.toUpperCase();
    
    const room = await Room.findOne({ roomId: normalizedRoomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      roomId: room.roomId,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      drawingData: room.drawingData,
      activeUsers: room.activeUsers
    });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clean up old rooms (admin endpoint)
router.delete('/cleanup', async (req, res) => {
  try {
    const result = await Room.cleanupOldRooms();
    res.json({ message: `Cleaned up ${result.deletedCount} old rooms` });
  } catch (error) {
    console.error('Error cleaning up rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 