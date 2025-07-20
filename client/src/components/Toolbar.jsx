import React from 'react';
import styled from 'styled-components';
import ConnectionStatus from './ConnectionStatus';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const ToolbarContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 15px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1000;

  @media (max-width: 600px) {
    flex-direction: column;
    top: 10px;
    left: 50%;
    padding: 8px 10px;
    gap: 8px;
    font-size: 0.95rem;
  }
`;

const ColorButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid ${props => props.isActive ? '#333' : '#ccc'};
  background-color: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  }

  &::after {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 50%;
    border: 2px solid transparent;
    transition: border-color 0.2s ease;
  }

  ${props => props.isActive && `
    &::after {
      border-color: #333;
    }
  `}

  @media (pointer: coarse) {
    width: 48px;
    height: 48px;
  }
`;

const StrokeWidthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

const StrokeWidthLabel = styled.span`
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
`;

const StrokeWidthSlider = styled.input`
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: #ddd;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #333;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #333;
    cursor: pointer;
    border: none;
  }
`;

const ClearButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }

  &::before {
    content: "⚠️";
    font-size: 0.8rem;
  }
`;

const LeaveRoomButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #ff6b6b;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  margin-left: 10px;
  margin-top: 0;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.18);
  z-index: 1001;
  &:hover {
    background: #ee5a24;
    transform: translateY(-1px);
  }
  @media (max-width: 600px) {
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 30px;
  background: #ddd;
  margin: 0 5px;
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #666;
`;

const UserCount = styled.span`
  background: #4ECDC4;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const RoomCode = styled.span`
  font-weight: 600;
  color: #333;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  @media (max-width: 600px) {
    font-size: 0.95rem;
  }
`;

const Toolbar = ({ 
  currentColor, 
  onColorChange, 
  strokeWidth, 
  onStrokeWidthChange, 
  onClearCanvas,
  roomCode,
  userCount,
  socket,
  onLeaveRoom // <-- add this prop
}) => {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = () => setOpen(o => !o);

  const colors = [
    { name: 'black', value: '#000000' },
    { name: 'red', value: '#FF0000' },
    { name: 'blue', value: '#0000FF' },
    { name: 'green', value: '#00FF00' }
  ];

  return (
    <>
      {isMobile && (
        <button
          style={{
            position: 'fixed',
            top: 10,
            left: 10,
            zIndex: 1100,
            background: '#4ECDC4',
            border: 'none',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            color: '#fff',
          }}
          onClick={handleToggle}
          aria-label={open ? 'Hide toolbar' : 'Show toolbar'}
        >
          {open ? <FaTimes size={20} color="#fff" /> : <FaBars size={20} color="#fff" />}
        </button>
      )}
      <ToolbarContainer style={{ display: !isMobile || open ? 'flex' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ConnectionStatus socket={socket} />
          <RoomInfo>
            <span>Room:</span>
            <RoomCode>{roomCode}</RoomCode>
            <UserCount>{userCount} users</UserCount>
          </RoomInfo>
        </div>

        <Divider />

        {colors.map(color => (
          <ColorButton
            key={color.name}
            color={color.value}
            isActive={currentColor === color.value}
            onClick={() => onColorChange(color.value)}
            title={color.name}
          />
        ))}

        <Divider />

        <StrokeWidthContainer>
          <StrokeWidthLabel>Width</StrokeWidthLabel>
          <StrokeWidthSlider
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
          />
        </StrokeWidthContainer>

        <Divider />

        <ClearButton onClick={onClearCanvas}>
          Clear
        </ClearButton>

        <LeaveRoomButton onClick={onLeaveRoom}>
          Leave Room
        </LeaveRoomButton>
      </ToolbarContainer>
    </>
  );
};

export default Toolbar; 