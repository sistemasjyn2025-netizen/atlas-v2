import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}

interface DrawingWorkspaceState {
  transform: ViewTransform;
  svgContent: string | null;
  setTransform: React.Dispatch<React.SetStateAction<ViewTransform>>;
  setSvgContent: (svg: string) => void;
  fitToScreen: (paperWidth: number, paperHeight: number, containerWidth: number, containerHeight: number) => void;
  zoomIn: (cW: number, cH: number) => void;
  zoomOut: (cW: number, cH: number) => void;
}

const DrawingWorkspaceContext = createContext<DrawingWorkspaceState | null>(null);

export const DrawingWorkspaceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
  const [svgContent, setSvgContent] = useState<string | null>(null);

  const fitToScreen = useCallback((pW: number, pH: number, cW: number, cH: number) => {
    const scaleX = cW / pW;
    const scaleY = cH / pH;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 10% margen
    
    const x = (cW - pW * scale) / 2;
    const y = (cH - pH * scale) / 2;
    
    setTransform({ x, y, scale });
  }, []);

  const zoomIn = useCallback((cW: number, cH: number) => {
    setTransform(prev => {
      const zoomFactor = 1.2;
      const newScale = prev.scale * zoomFactor;
      const centerX = cW / 2;
      const centerY = cH / 2;
      const contentX = (centerX - prev.x) / prev.scale;
      const contentY = (centerY - prev.y) / prev.scale;
      return { x: centerX - contentX * newScale, y: centerY - contentY * newScale, scale: newScale };
    });
  }, []);

  const zoomOut = useCallback((cW: number, cH: number) => {
    setTransform(prev => {
      const zoomFactor = 1 / 1.2;
      const newScale = prev.scale * zoomFactor;
      const centerX = cW / 2;
      const centerY = cH / 2;
      const contentX = (centerX - prev.x) / prev.scale;
      const contentY = (centerY - prev.y) / prev.scale;
      return { x: centerX - contentX * newScale, y: centerY - contentY * newScale, scale: newScale };
    });
  }, []);

  const value = useMemo(() => ({
    transform, setTransform, svgContent, setSvgContent, fitToScreen, zoomIn, zoomOut
  }), [transform, svgContent, fitToScreen, zoomIn, zoomOut]);

  return (
    <DrawingWorkspaceContext.Provider value={value}>
      {children}
    </DrawingWorkspaceContext.Provider>
  );
};

export const useDrawingWorkspace = () => {
  const context = useContext(DrawingWorkspaceContext);
  if (!context) throw new Error('useDrawingWorkspace must be used within DrawingWorkspaceProvider');
  return context;
};
