import React from 'react';
import { PublishButton } from './PublishButton';

interface DrawingToolbarProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFit: () => void;
    svgContentRecord: Record<string, string>;
    dxfContentRecord: Record<string, string>;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
    onZoomIn,
    onZoomOut,
    onFit,
    svgContentRecord,
    dxfContentRecord
}) => {
    return (
        <div style={{
            display: 'flex',
            padding: '8px',
            backgroundColor: 'var(--surface-overlay, #ffffff)',
            borderBottom: '1px solid var(--border-subtle, #e5e5e5)',
            gap: '8px'
        }}>
            <button onClick={onZoomIn} style={buttonStyle} title="Zoom +">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <button onClick={onZoomOut} style={buttonStyle} title="Zoom -">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <button onClick={onFit} style={{...buttonStyle, padding: '6px 12px', marginLeft: '4px'}} title="Ajustar a Pantalla">
                Ajustar
            </button>
            <PublishButton 
                svgContentRecord={svgContentRecord} 
                dxfContentRecord={dxfContentRecord} 
            />
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
    padding: '6px',
    backgroundColor: 'var(--surface-inset)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)'
};
