import { useState, useCallback } from 'react';

export const useZoomController = (initialScale = 1) => {
    const [scale, setScale] = useState(initialScale);

    const zoomIn = useCallback(() => {
        setScale(s => Math.min(s * 1.2, 10)); // Max zoom limit
    }, []);

    const zoomOut = useCallback(() => {
        setScale(s => Math.max(s / 1.2, 0.1)); // Min zoom limit
    }, []);

    const setExactZoom = useCallback((newScale: number) => {
        setScale(newScale);
    }, []);

    const handleWheelZoom = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) zoomIn();
            else zoomOut();
        }
    }, [zoomIn, zoomOut]);

    return {
        scale,
        zoomIn,
        zoomOut,
        setExactZoom,
        handleWheelZoom
    };
};
