import React from 'react';
import type { OverlayState } from '../controllers/useOverlayController';

interface OverlayLayerProps {
    overlayState: OverlayState;
}

export const OverlayLayer: React.FC<OverlayLayerProps> = ({ overlayState }) => {
    return (
        <svg 
            className="overlay-layer"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10
            }}
        >
            {/* Future markup, highlights, and selection bounding boxes go here */}
        </svg>
    );
};
