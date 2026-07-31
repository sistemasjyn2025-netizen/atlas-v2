import React from 'react';

interface DrawingCanvasProps {
    svgContent: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ svgContent }) => {
    return (
        <div 
            className="drawing-canvas-container"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none' // Let viewport handle events
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};
