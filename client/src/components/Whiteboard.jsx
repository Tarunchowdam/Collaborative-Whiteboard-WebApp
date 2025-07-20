import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';

const WhiteboardContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const Whiteboard = ({ socket, roomCode }) => {
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [userCount, setUserCount] = useState(1);
  const [cursors, setCursors] = useState({});

  const handleClearCanvas = () => {
    console.log('Clear button clicked');
    if (window.confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
      console.log('User confirmed clear');
      if (socket) {
        console.log('Emitting clear-canvas event');
        socket.emit('clear-canvas');
      } else {
        console.log('Socket not available');
      }
    }
  };

  const handleUserCountChange = (count) => {
    setUserCount(count);
  };

  const handleCursorsUpdate = (newCursors) => {
    setCursors(newCursors);
  };

  const handleLeaveRoom = () => {
    // You can replace this with navigation or socket disconnect logic as needed
    window.location.reload();
  };

  return (
    <WhiteboardContainer>
      <DrawingCanvas
        socket={socket}
        roomCode={roomCode}
        currentColor={currentColor}
        strokeWidth={strokeWidth}
        onUserCountChange={handleUserCountChange}
        onCursorsUpdate={handleCursorsUpdate}
      />
      
      <Toolbar
        currentColor={currentColor}
        onColorChange={setCurrentColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        onClearCanvas={handleClearCanvas}
        roomCode={roomCode}
        userCount={userCount}
        socket={socket}
        onLeaveRoom={handleLeaveRoom}
      />
      
      <UserCursors
        cursors={cursors}
        currentUserId={socket?.id}
      />
    </WhiteboardContainer>
  );
};

export default Whiteboard; 