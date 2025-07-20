const Room = require('../models/Room');

module.exports = (io) => {
  // Store active users per room
  const roomUsers = new Map();
  
  // Throttle cursor updates to 60fps
  const cursorThrottle = new Map();
  const CURSOR_THROTTLE_MS = 16; // ~60fps

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    let currentRoom = null;
    let userId = null;

    // Join room
    socket.on('join-room', async (data) => {
      try {
        const { roomId } = data;
        const normalizedRoomId = roomId.toUpperCase();
        
        // Leave previous room if any
        if (currentRoom) {
          socket.leave(currentRoom);
          leaveRoom(currentRoom, socket.id);
        }

        // Join new room
        socket.join(normalizedRoomId);
        currentRoom = normalizedRoomId;
        userId = socket.id;

        // Initialize room users if not exists
        if (!roomUsers.has(normalizedRoomId)) {
          roomUsers.set(normalizedRoomId, new Map());
        }

        // Add user to room
        const roomUserMap = roomUsers.get(normalizedRoomId);
        roomUserMap.set(socket.id, {
          id: socket.id,
          color: getRandomColor(),
          position: { x: 0, y: 0 }
        });

        // Emit updated user count to all clients in the room
        io.to(normalizedRoomId).emit('user-count', { count: roomUserMap.size });

        // Update room in database
        try {
          await Room.findOneAndUpdate(
            { roomId: normalizedRoomId },
            { $inc: { activeUsers: 1 } },
            { upsert: true }
          );
        } catch (error) {
          console.log('⚠️ Database operation failed, continuing without persistence');
        }

        // Notify others in room
        socket.to(normalizedRoomId).emit('user-joined', {
          userId: socket.id,
          color: roomUserMap.get(socket.id).color
        });

        // Send current room state to new user
        try {
          const room = await Room.findOne({ roomId: normalizedRoomId });
          if (room) {
            socket.emit('room-state', {
              drawingData: room.drawingData,
              users: Array.from(roomUserMap.values())
            });
          } else {
            // If no room in database, send empty state
            socket.emit('room-state', {
              drawingData: [],
              users: Array.from(roomUserMap.values())
            });
          }
        } catch (error) {
          console.log('⚠️ Database read failed, sending empty room state');
          socket.emit('room-state', {
            drawingData: [],
            users: Array.from(roomUserMap.values())
          });
        }

        console.log(`User ${socket.id} joined room ${normalizedRoomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Cursor movement
    socket.on('cursor-move', (data) => {
      if (!currentRoom || !userId) return;

      const now = Date.now();
      const lastUpdate = cursorThrottle.get(socket.id) || 0;

      if (now - lastUpdate < CURSOR_THROTTLE_MS) return;

      cursorThrottle.set(socket.id, now);

      const roomUserMap = roomUsers.get(currentRoom);
      if (roomUserMap && roomUserMap.has(socket.id)) {
        roomUserMap.get(socket.id).position = data.position;
        
        // Broadcast to other users in room
        socket.to(currentRoom).emit('cursor-move', {
          userId: socket.id,
          position: data.position
        });
      }
    });

    // Drawing events
    socket.on('draw-start', async (data) => {
      console.log('🎨 Server received draw-start from user:', socket.id, 'in room:', currentRoom, 'data:', data);
      if (!currentRoom) {
        console.log('❌ No current room for draw-start');
        return;
      }

      console.log('📡 Broadcasting draw-start to room:', currentRoom);
      // Broadcast to other users
      socket.to(currentRoom).emit('draw-start', {
        userId: socket.id,
        ...data
      });

      // Store in database
      try {
        await Room.findOneAndUpdate(
          { roomId: currentRoom },
          { 
            $push: { 
              drawingData: {
                type: 'stroke',
                data: {
                  action: 'start',
                  ...data
                },
                timestamp: new Date()
              }
            }
          }
        );
      } catch (error) {
        console.log('⚠️ Database save failed for draw start, continuing without persistence');
      }
    });

    socket.on('draw-move', async (data) => {
      if (!currentRoom) return;

      // Broadcast to other users
      socket.to(currentRoom).emit('draw-move', {
        userId: socket.id,
        ...data
      });

      // Store in database
      try {
        await Room.findOneAndUpdate(
          { roomId: currentRoom },
          { 
            $push: { 
              drawingData: {
                type: 'stroke',
                data: {
                  action: 'move',
                  ...data
                },
                timestamp: new Date()
              }
            }
          }
        );
      } catch (error) {
        console.log('⚠️ Database save failed for draw move, continuing without persistence');
      }
    });

    socket.on('draw-end', async (data) => {
      if (!currentRoom) return;

      // Broadcast to other users
      socket.to(currentRoom).emit('draw-end', {
        userId: socket.id,
        ...data
      });

      // Store in database
      try {
        await Room.findOneAndUpdate(
          { roomId: currentRoom },
          { 
            $push: { 
              drawingData: {
                type: 'stroke',
                data: {
                  action: 'end',
                  ...data
                },
                timestamp: new Date()
              }
            }
          }
        );
      } catch (error) {
        console.log('⚠️ Database save failed for draw end, continuing without persistence');
      }
    });

    // Clear canvas
    socket.on('clear-canvas', async () => {
      console.log('Clear canvas event received from user:', socket.id);
      if (!currentRoom) {
        console.log('No current room');
        return;
      }

      console.log('Broadcasting clear canvas to room:', currentRoom);
      // Broadcast to all users in the room (including sender)
      io.to(currentRoom).emit('clear-canvas', {
        userId: socket.id
      });

      // Clear all drawing data from database
      try {
        console.log('Clearing drawing data from database for room:', currentRoom);
        await Room.findOneAndUpdate(
          { roomId: currentRoom },
          { 
            $set: { 
              drawingData: []
            }
          }
        );
        console.log('Successfully cleared drawing data from database');
      } catch (error) {
        console.log('⚠️ Database clear failed, continuing without persistence');
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      if (currentRoom) {
        leaveRoom(currentRoom, socket.id);
        socket.to(currentRoom).emit('user-left', { userId: socket.id });
      }

      cursorThrottle.delete(socket.id);
    });

    // Helper function to leave room
    async function leaveRoom(roomId, userId) {
      const roomUserMap = roomUsers.get(roomId);
      if (roomUserMap) {
        roomUserMap.delete(userId);
        
        // Remove room if empty
        if (roomUserMap.size === 0) {
          roomUsers.delete(roomId);
        }

        // Emit updated user count to all clients in the room
        io.to(roomId).emit('user-count', { count: roomUserMap.size });

        // Update database
        try {
          await Room.findOneAndUpdate(
            { roomId },
            { $inc: { activeUsers: -1 } }
          );
        } catch (error) {
          console.log('⚠️ Database update failed on leave, continuing without persistence');
        }
      }
    }

    // Helper function to get random color for user
    function getRandomColor() {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  });
}; 