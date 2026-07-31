import { useState } from 'react';

export interface SheetOption {
    id: string;
    name: string;
}

export const useSheetNavigator = (sheets: SheetOption[], initialSheetId?: string) => {
    const [activeSheetId, setActiveSheetId] = useState<string | null>(initialSheetId || (sheets.length > 0 ? sheets[0].id : null));

    const switchSheet = (id: string) => {
        setActiveSheetId(id);
    };

    const nextSheet = () => {
        if (!activeSheetId) return;
        const index = sheets.findIndex(s => s.id === activeSheetId);
        if (index >= 0 && index < sheets.length - 1) {
            setActiveSheetId(sheets[index + 1].id);
        }
    };

    const prevSheet = () => {
        if (!activeSheetId) return;
        const index = sheets.findIndex(s => s.id === activeSheetId);
        if (index > 0) {
            setActiveSheetId(sheets[index - 1].id);
        }
    };

    return {
        activeSheetId,
        switchSheet,
        nextSheet,
        prevSheet
    };
};
