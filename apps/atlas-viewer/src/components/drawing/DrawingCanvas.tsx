import React from 'react';
import { useDrawingWorkspace } from '../../contexts/DrawingWorkspaceContext';

export const DrawingCanvas: React.FC = () => {
  const { transform, svgContent } = useDrawingWorkspace();

  if (!svgContent) {
    return <div className="drawing-empty-state">No drawing loaded</div>;
  }

  // Aceleración CSS pura impulsada por GPU
  const style: React.CSSProperties = {
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
    transformOrigin: '0 0',
    willChange: 'transform',
    position: 'absolute',
    top: 0,
    left: 0,
  };

  return (
    <div 
      style={style} 
      className="drawing-hardware-layer"
      dangerouslySetInnerHTML={{ __html: svgContent }} 
    />
  );
};
