import { useState, useCallback, useRef } from 'react';

export const usePanController = (initialX = 0, initialY = 0) => {
    const [translate, setTranslate] = useState({ x: initialX, y: initialY });
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        // Middle mouse button (1) or main button with Space (space not handled here directly but we can assume normal drag for now)
        if (e.button === 1 || e.button === 0) {
            isDragging.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (isDragging.current) {
            const dx = e.clientX - lastPos.current.x;
            const dy = e.clientY - lastPos.current.y;
            lastPos.current = { x: e.clientX, y: e.clientY };

            setTranslate(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));
        }
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (isDragging.current) {
            isDragging.current = false;
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        }
    }, []);

    return {
        translate,
        setTranslate,
        handlers: {
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerCancel: handlePointerUp
        }
    };
};
