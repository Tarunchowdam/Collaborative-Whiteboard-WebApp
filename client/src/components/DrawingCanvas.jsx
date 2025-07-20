import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';

const CanvasContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #f8f9fa;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  display: block;
  cursor: crosshair;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`;

const ConnectionStatus = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1001;
  background: ${props => props.isConnected ? '#4ECDC4' : '#ff6b6b'};
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const DrawingCanvas = ({ 
  socket, 
  roomCode, 
  currentColor, 
  strokeWidth, 
  onUserCountChange,
  onCursorsUpdate 
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [cursors, setCursors] = useState({});
  const [userCount, setUserCount] = useState(1);
  const latestDrawingData = useRef([]);

  // Redraw canvas from stored data
  const redrawCanvas = useCallback((drawingData) => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawingData.forEach(command => {
      if (command.type === 'stroke') {
        const { action, x, y, color, width } = command.data;
        if (action === 'start') {
          context.beginPath();
          context.moveTo(x, y);
          context.strokeStyle = color;
          context.lineWidth = width;
        } else if (action === 'move') {
          context.lineTo(x, y);
          context.stroke();
        }
      }
    });
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (contextRef.current && canvasRef.current) {
        redrawCanvas(latestDrawingData.current);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = currentColor;
    context.lineWidth = strokeWidth;
    contextRef.current = context;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Update context when color or stroke width changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = currentColor;
      contextRef.current.lineWidth = strokeWidth;
    }
  }, [currentColor, strokeWidth]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('join-room', { roomId: roomCode });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Update latestDrawingData and redraw when new data arrives
    const handleRoomState = (data) => {
      if (data.drawingData) {
        latestDrawingData.current = data.drawingData;
        if (contextRef.current && canvasRef.current) {
          redrawCanvas(data.drawingData);
        }
      }
      
      // Update cursors
      if (data.users) {
        const cursorsData = {};
        data.users.forEach(user => {
          cursorsData[user.id] = {
            position: user.position,
            color: user.color
          };
        });
        setCursors(cursorsData);
        setUserCount(data.users.length);
        onUserCountChange(data.users.length);
        onCursorsUpdate(cursorsData);
      }
    };

    const handleUserJoined = (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: {
          position: { x: 0, y: 0 },
          color: data.color
        }
      }));
      setUserCount(prev => prev + 1);
      onUserCountChange(userCount + 1);
    };

    const handleUserLeft = (data) => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[data.userId];
        return newCursors;
      });
      setUserCount(prev => prev - 1);
      onUserCountChange(userCount - 1);
    };

    const handleCursorMove = (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: {
          ...prev[data.userId],
          position: data.position
        }
      }));
    };

    const handleDrawStart = (data) => {
      console.log('🎨 Received draw-start from user:', data.userId, 'my socket ID:', socket.id);
      if (data.userId === socket.id) {
        console.log('⏭️ Skipping own draw event');
        return;
      }
      
      const context = contextRef.current;
      if (!context) {
        console.log('❌ No context available for draw-start');
        return;
      }

      console.log('📝 Starting to draw at:', data.x, data.y, 'color:', data.color, 'width:', data.width);
      context.beginPath();
      context.moveTo(data.x, data.y);
      context.strokeStyle = data.color;
      context.lineWidth = data.width;
    };

    const handleDrawMove = (data) => {
      console.log('🎨 Received draw-move from user:', data.userId, 'my socket ID:', socket.id);
      if (data.userId === socket.id) {
        console.log('⏭️ Skipping own draw event');
        return;
      }
      
      const context = contextRef.current;
      if (!context) {
        console.log('❌ No context available for draw-move');
        return;
      }

      console.log('📝 Drawing line to:', data.x, data.y);
      context.lineTo(data.x, data.y);
      context.stroke();
    };

    const handleDrawEnd = (data) => {
      console.log('🎨 Received draw-end from user:', data.userId, 'my socket ID:', socket.id);
      if (data.userId === socket.id) {
        console.log('⏭️ Skipping own draw event');
        return;
      }
      
      const context = contextRef.current;
      if (!context) {
        console.log('❌ No context available for draw-end');
        return;
      }

      console.log('📝 Ending draw path');
      context.closePath();
    };

    const handleClearCanvas = () => {
      console.log('Client received clear canvas event');
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) {
        console.log('Canvas or context not available');
        return;
      }

      console.log('Clearing canvas with dimensions:', canvas.width, 'x', canvas.height);
      context.clearRect(0, 0, canvas.width, canvas.height);
      console.log('Canvas cleared successfully');
    };

    // Socket event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room-state', handleRoomState);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('cursor-move', handleCursorMove);
    socket.on('draw-start', handleDrawStart);
    socket.on('draw-move', handleDrawMove);
    socket.on('draw-end', handleDrawEnd);
    socket.on('clear-canvas', handleClearCanvas);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room-state', handleRoomState);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('cursor-move', handleCursorMove);
      socket.off('draw-start', handleDrawStart);
      socket.off('draw-move', handleDrawMove);
      socket.off('draw-end', handleDrawEnd);
      socket.off('clear-canvas', handleClearCanvas);
    };
  }, [socket, roomCode, onUserCountChange, onCursorsUpdate, userCount, redrawCanvas]);

  useEffect(() => {
    if (!socket) return;
    const handleUserCount = (data) => {
      setUserCount(data.count);
      onUserCountChange(data.count);
    };
    socket.on('user-count', handleUserCount);
    return () => {
      socket.off('user-count', handleUserCount);
    };
  }, [socket]);

  // Drawing event handlers
  const startDrawing = useCallback((e) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    context.beginPath();
    context.moveTo(x, y);

    // Emit draw start
    console.log('🚀 Emitting draw-start:', { x, y, color: currentColor, width: strokeWidth });
    socket.emit('draw-start', {
      x,
      y,
      color: currentColor,
      width: strokeWidth
    });
  }, [socket, currentColor, strokeWidth]);

  // Drawing data compression for draw-move
  const lastDrawPoint = useRef({ x: null, y: null });
  const MIN_DIST = 2; // Minimum distance in px to emit a new point

  const emitDrawMove = useCallback((x, y, ...rest) => {
    if (!socket) return;
    const last = lastDrawPoint.current;
    if (last.x !== null && last.y !== null) {
      const dx = x - last.x;
      const dy = y - last.y;
      if (Math.sqrt(dx * dx + dy * dy) < MIN_DIST) return;
    }
    lastDrawPoint.current = { x, y };
    socket.emit('draw-move', { x, y, ...rest });
  }, [socket]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();

    // Emit draw move
    console.log('🚀 Emitting draw-move:', { x, y, color: currentColor, width: strokeWidth });
    emitDrawMove(x, y, { color: currentColor, width: strokeWidth });
  }, [isDrawing, socket, currentColor, strokeWidth, emitDrawMove]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    const context = contextRef.current;
    if (!context) return;

    context.closePath();

    // Emit draw end
    console.log('🚀 Emitting draw-end:', { color: currentColor, width: strokeWidth });
    socket.emit('draw-end', {
      color: currentColor,
      width: strokeWidth
    });
  }, [isDrawing, socket, currentColor, strokeWidth]);

  // Throttle outgoing cursor-move events
  const lastCursorPosition = useRef({ x: null, y: null });
  const rafId = useRef(null);
  const pendingCursor = useRef(null);

  const emitCursorMove = useCallback((x, y) => {
    if (!socket) return;
    if (lastCursorPosition.current.x === x && lastCursorPosition.current.y === y) return;
    lastCursorPosition.current = { x, y };
    socket.emit('cursor-move', { position: { x, y } });
  }, [socket]);

  const scheduleCursorEmit = useCallback((x, y) => {
    pendingCursor.current = { x, y };
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      if (pendingCursor.current) {
        emitCursorMove(pendingCursor.current.x, pendingCursor.current.y);
        pendingCursor.current = null;
      }
      rafId.current = null;
    });
  }, [emitCursorMove]);

  // Mouse move handler for cursor tracking
  const handlePointerMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    scheduleCursorEmit(x, y);
  };

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [scheduleCursorEmit]);

  // Convert touch event to canvas coordinates
  const getTouchPos = (touch, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  // Touch start
  const handleTouchStart = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];
    const { x, y } = getTouchPos(touch, canvas);
    // Call your startDrawing logic here with x, y
    startDrawing({ clientX: x, clientY: y, isTouch: true });
  };

  // Touch move
  const handleTouchMove = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];
    const { x, y } = getTouchPos(touch, canvas);
    // Call your draw logic here with x, y
    draw({ clientX: x, clientY: y, isTouch: true });
  };

  // Touch end
  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopDrawing();
  };

  return (
    <CanvasContainer>
      <Canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </CanvasContainer>
  );
};

export default DrawingCanvas; 