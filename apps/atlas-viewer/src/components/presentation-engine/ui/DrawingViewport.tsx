import React, { useRef } from 'react';
import { DrawingCanvas } from './DrawingCanvas';
import { OverlayLayer } from './OverlayLayer';
import type { OverlayState } from '../controllers/useOverlayController';

interface DrawingViewportProps {
    svgContent: string;
    scale: number;
    translate: { x: number, y: number };
    overlayState: OverlayState;
    onWheel: (e: React.WheelEvent) => void;
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
}

export const DrawingViewport: React.FC<DrawingViewportProps> = ({
    svgContent,
    scale,
    translate,
    overlayState,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel
}) => {
    return (
        <div 
            className="drawing-viewport"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: 'var(--surface-sunken, #e5e5e5)', // Typical CAD background
                cursor: 'crosshair',
                touchAction: 'none'
            }}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
        >
            <div 
                className="drawing-transform-layer"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transformOrigin: '0 0',
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`
                }}
            >
                <DrawingCanvas svgContent={svgContent} />
                <OverlayLayer overlayState={overlayState} />
            </div>
        </div>
    );
};
