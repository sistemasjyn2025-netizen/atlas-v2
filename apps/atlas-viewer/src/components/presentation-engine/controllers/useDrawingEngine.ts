import { useState, useEffect } from 'react';
import { usePipelineContext } from '../../../contexts/PipelineContext';
import { DrawingEngineFacade } from '@atlas/drawing-engine';
import type { SheetOption } from './useSheetNavigator';

export const useDrawingEngine = () => {
    const { pipelineResult } = usePipelineContext();
    const [svgContentRecord, setSvgContentRecord] = useState<Record<string, string>>({});
    const [dxfContentRecord, setDxfContentRecord] = useState<Record<string, string>>({});
    const [sheets, setSheets] = useState<SheetOption[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!pipelineResult || !pipelineResult.success) return;

        let isMounted = true;

        const generateDrawings = async () => {
            setIsGenerating(true);
            try {
                const facade = new DrawingEngineFacade();
                const { svgContentRecord: svgs, dxfContentRecord: dxfs } = await facade.generateDrawings(pipelineResult);

                if (isMounted) {
                    setSvgContentRecord(svgs);
                    setDxfContentRecord(dxfs);
                    
                    // The keys of the record are the sheet IDs
                    // In a real app we would get the actual names from the sheet domain models
                    // For MVP we just format the IDs to look like names
                    const newSheets = Object.keys(svgs).map((id, index) => ({
                        id,
                        name: `Plano ${index + 1}`
                    }));
                    setSheets(newSheets);
                }
            } catch (err) {
                console.error("DrawingEngineFacade Error:", err);
            } finally {
                if (isMounted) setIsGenerating(false);
            }
        };

        generateDrawings();

        return () => {
            isMounted = false;
        };
    }, [pipelineResult]);

    return {
        svgContentRecord,
        dxfContentRecord,
        sheets,
        isGenerating
    };
};
