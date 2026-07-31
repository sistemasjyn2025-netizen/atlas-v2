import React from 'react';
import './tokens.css';

interface DividerProps {
  vertical?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ vertical }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--border-strong)',
        ...(vertical ? { width: '1px', height: '100%', margin: '0 var(--space-2)' } : { height: '1px', width: '100%', margin: 'var(--space-2) 0' })
      }}
    />
  );
};
