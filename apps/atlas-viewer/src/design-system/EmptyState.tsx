import React from 'react';
import './tokens.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex-center" style={{ flexDirection: 'column', height: '100%', padding: 'var(--space-6)', textAlign: 'center' }}>
      {icon && <div style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>{icon}</div>}
      <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{title}</h3>
      {description && <p style={{ margin: 'var(--space-2) 0 var(--space-4)', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: 1.5 }}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
