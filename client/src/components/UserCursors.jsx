import React from 'react';
import styled from 'styled-components';

const CursorContainer = styled.div`
  position: absolute;
  pointer-events: none;
  z-index: 100;
  transition: all 0.1s ease;
`;

const CursorDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: -4px;
  left: -4px;
`;

const CursorLabel = styled.div`
  position: absolute;
  top: 12px;
  left: 0;
  background: ${props => props.color};
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
`;

const UserCursors = ({ cursors, currentUserId }) => {
  return (
    <>
      {Object.entries(cursors).map(([userId, cursor]) => {
        if (userId === currentUserId) return null;
        
        return (
          <CursorContainer
            key={userId}
            style={{
              left: cursor.position.x,
              top: cursor.position.y,
            }}
          >
            <CursorDot color={cursor.color} />
            <CursorLabel color={cursor.color}>
              User {userId.slice(-4)}
            </CursorLabel>
          </CursorContainer>
        );
      })}
    </>
  );
};

export default UserCursors; 