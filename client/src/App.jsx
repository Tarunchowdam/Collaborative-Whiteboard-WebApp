import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';
import './App.css';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Connecting to server at:', API_BASE_URL);
    const newSocket = io(API_BASE_URL);
    
    newSocket.on('connect', () => {
      console.log('✅ Connected to server, socket ID:', newSocket.id);
    });
    
    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });
    
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && currentRoom && currentRoom.roomId) {
      console.log('🚪 Emitting join-room for', currentRoom.roomId);
      socket.emit('join-room', { roomId: currentRoom.roomId });
    }
  }, [socket, currentRoom]);

  const handleJoinRoom = async (roomCode) => {
    setIsConnecting(true);
    console.log('🚪 Joining room:', roomCode);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomCode }),
      });

      console.log('📡 Room join response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join room');
      }

      const roomData = await response.json();
      console.log('✅ Room joined successfully:', roomData);
      setCurrentRoom(roomData);
    } catch (error) {
      console.error('❌ Error joining room:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.disconnect();
    }
    setCurrentRoom(null);
  };

  if (!currentRoom) {
    return <RoomJoin onJoinRoom={handleJoinRoom} />;
  }

  return (
    <div className="App">
      <Whiteboard 
        socket={socket} 
        roomCode={currentRoom.roomId}
      />
    </div>
  );
}

export default App;
