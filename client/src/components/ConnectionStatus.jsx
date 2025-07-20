import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const StatusDot = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => (props.connected ? '#4cd137' : '#e84118')};
  margin-right: 8px;
  border: 2px solid #fff;
  box-shadow: 0 0 4px rgba(0,0,0,0.1);
`;

const StatusText = styled.span`
  font-size: 0.85rem;
  color: #666;
`;

const ConnectionStatus = ({ socket }) => {
  const [connected, setConnected] = useState(socket?.connected);

  useEffect(() => {
    if (!socket) return;
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    setConnected(socket.connected);
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <StatusDot connected={connected} />
      <StatusText>{connected ? 'Online' : 'Offline'}</StatusText>
    </div>
  );
};

export default ConnectionStatus; 