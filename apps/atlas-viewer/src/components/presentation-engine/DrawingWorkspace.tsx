import React from 'react';
import { useZoomController } from './controllers/useZoomController';
import { usePanController } from './controllers/usePanController';
import { useSheetNavigator, type SheetOption } from './controllers/useSheetNavigator';
import { useOverlayController } from './controllers/useOverlayController';
import { DrawingViewport } from './ui/DrawingViewport';
import { DrawingToolbar } from './ui/DrawingToolbar';

interface DrawingWorkspaceProps {
    sheets: SheetOption[];
    svgContentRecord: Record<string, string>; // Maps sheet ID to SVG string
    dxfContentRecord: Record<string, string>; // Maps sheet ID to DXF string
}

export const DrawingWorkspace: React.FC<DrawingWorkspaceProps> = ({ sheets, svgContentRecord, dxfContentRecord }) => {
    const { activeSheetId, nextSheet, prevSheet, switchSheet } = useSheetNavigator(sheets);
    const { scale, zoomIn, zoomOut, setExactZoom, handleWheelZoom } = useZoomController(1);
    const { translate, setTranslate, handlers: panHandlers } = usePanController(0, 0);
    const { overlayState } = useOverlayController();

    const handleFit = () => {
        setTranslate({ x: 0, y: 0 });
        setExactZoom(1);
        // More complex logic for Fit to Extents would read viewBox bounds
    };

    const activeSvg = activeSheetId ? svgContentRecord[activeSheetId] || '' : '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <DrawingToolbar 
                onZoomIn={zoomIn} 
                onZoomOut={zoomOut} 
                onFit={handleFit} 
                svgContentRecord={svgContentRecord}
                dxfContentRecord={dxfContentRecord}
            />
            
            <div style={{ flex: 1, position: 'relative' }}>
                <DrawingViewport 
                    svgContent={activeSvg}
                    scale={scale}
                    translate={translate}
                    overlayState={overlayState}
                    onWheel={handleWheelZoom}
                    onPointerDown={panHandlers.onPointerDown}
                    onPointerMove={panHandlers.onPointerMove}
                    onPointerUp={panHandlers.onPointerUp}
                    onPointerCancel={panHandlers.onPointerCancel}
                />
            </div>

            <div style={{ 
                display: 'flex', 
                backgroundColor: 'var(--surface-tertiary)', 
                borderTop: '1px solid var(--border-subtle)',
                padding: '4px 8px',
                gap: '4px',
                boxShadow: 'var(--shadow-inset)'
            }}>
                <button onClick={prevSheet} disabled={!activeSheetId || sheets[0]?.id === activeSheetId} style={tabButtonStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                {sheets.map(sheet => (
                    <button 
                        key={sheet.id}
                        onClick={() => switchSheet(sheet.id)}
                        style={{
                            ...tabButtonStyle,
                            backgroundColor: sheet.id === activeSheetId ? 'var(--surface-primary)' : 'transparent',
                            color: sheet.id === activeSheetId ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: sheet.id === activeSheetId ? 600 : 400,
                            borderRadius: 'var(--radius-sm)',
                            border: sheet.id === activeSheetId ? '1px solid var(--border-subtle)' : '1px solid transparent',
                            borderBottom: sheet.id === activeSheetId ? 'none' : '1px solid transparent'
                        }}
                    >
                        {sheet.name}
                    </button>
                ))}
                <button onClick={nextSheet} disabled={!activeSheetId || sheets[sheets.length - 1]?.id === activeSheetId} style={tabButtonStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
        </div>
    );
};

const tabButtonStyle: React.CSSProperties = {
    padding: '4px 12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    transition: 'color var(--transition-fast)'
};
