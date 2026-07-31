import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { usePipelineContext } from '../../../contexts/PipelineContext';

interface PublishButtonProps {
    svgContentRecord: Record<string, string>;
    dxfContentRecord: Record<string, string>;
}

export const PublishButton: React.FC<PublishButtonProps> = ({ svgContentRecord, dxfContentRecord }) => {
    const { pipelineResult } = usePipelineContext();
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = async () => {
        if (!pipelineResult) return;
        setIsPublishing(true);

        try {
            const zip = new JSZip();

            // Add BOM (mock for now if we don't have DeliverablesEngine hooked directly)
            zip.file("BOM.csv", "Part,Quantity,Weight\nColumn,4,1200kg\nRafter,4,800kg\n");

            // Add SVGs and DXFs
            const drawingFolder = zip.folder("Planos");
            if (drawingFolder) {
                Object.entries(svgContentRecord).forEach(([sheetId, svg]) => {
                    drawingFolder.file(`${sheetId}.svg`, svg);
                });
                Object.entries(dxfContentRecord).forEach(([sheetId, dxf]) => {
                    drawingFolder.file(`${sheetId}.dxf`, dxf);
                });
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            saveAs(blob, `atlas-project-${pipelineResult.projectId || 'demo'}.zip`);
        } catch (err) {
            console.error('Publish error:', err);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <button 
            onClick={handlePublish} 
            disabled={isPublishing || !pipelineResult}
            style={{
                marginLeft: 'auto',
                padding: '6px 16px',
                backgroundColor: 'var(--color-accent-default)',
                color: 'var(--text-on-accent)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                cursor: isPublishing ? 'wait' : 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'all var(--transition-fast)',
                opacity: (isPublishing || !pipelineResult) ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {isPublishing ? 'Exportando...' : 'Exportar Paquete (ZIP)'}
        </button>
    );
};
