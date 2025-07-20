import React, { useState } from 'react';
import styled from 'styled-components';

const JoinContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const JoinCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const Title = styled.h1`
  margin: 0 0 30px 0;
  font-size: 2.5rem;
  font-weight: 300;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  margin: 0 0 30px 0;
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  text-align: center;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: #999;
    text-transform: none;
  }
`;

const JoinButton = styled.button`
  width: 100%;
  padding: 15px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  margin-top: 10px;
  font-size: 0.9rem;
  text-align: center;
`;

const RoomJoin = ({ onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    // Validate room code format (alphanumeric, 6-8 characters)
    const roomCodeRegex = /^[A-Z0-9]{6,8}$/;
    if (!roomCodeRegex.test(roomCode.toUpperCase())) {
      setError('Room code must be 6-8 alphanumeric characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onJoinRoom(roomCode.toUpperCase());
    } catch (err) {
      setError(err.message || 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRoomCode(value);
    setError('');
  };

  return (
    <JoinContainer>
      <JoinCard>
        <Title>Whiteboard</Title>
        <Subtitle>
          Enter a room code to join or create a collaborative whiteboard
        </Subtitle>
        
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Enter room code (e.g., ABC123)"
            value={roomCode}
            onChange={handleInputChange}
            maxLength={8}
            autoFocus
          />
          
          <JoinButton type="submit" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Room'}
          </JoinButton>
        </form>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </JoinCard>
    </JoinContainer>
  );
};

export default RoomJoin; 