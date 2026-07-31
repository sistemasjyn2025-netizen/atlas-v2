import { useState, useCallback } from 'react';

export interface OverlayState {
    hoveredEntityId: string | null;
    selectedEntityIds: string[];
}

export const useOverlayController = () => {
    const [overlayState, setOverlayState] = useState<OverlayState>({
        hoveredEntityId: null,
        selectedEntityIds: [],
    });

    const setHoveredEntity = useCallback((id: string | null) => {
        setOverlayState(prev => ({ ...prev, hoveredEntityId: id }));
    }, []);

    const toggleSelection = useCallback((id: string) => {
        setOverlayState(prev => {
            const isSelected = prev.selectedEntityIds.includes(id);
            return {
                ...prev,
                selectedEntityIds: isSelected 
                    ? prev.selectedEntityIds.filter(e => e !== id)
                    : [...prev.selectedEntityIds, id]
            };
        });
    }, []);

    const clearSelection = useCallback(() => {
        setOverlayState(prev => ({ ...prev, selectedEntityIds: [] }));
    }, []);

    return {
        overlayState,
        setHoveredEntity,
        toggleSelection,
        clearSelection
    };
};
