import React from 'react';
import './tokens.css';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
}

export const Panel: React.FC<PanelProps> = ({ children, title, headerAction, noPadding, style, ...props }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-primary)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        ...style
      }}
      {...props}
    >
      {(title || headerAction) && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--border-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--surface-secondary)',
        }}>
          {title && <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>{title}</span>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div style={{ padding: noPadding ? 0 : 'var(--space-4)', flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
};
