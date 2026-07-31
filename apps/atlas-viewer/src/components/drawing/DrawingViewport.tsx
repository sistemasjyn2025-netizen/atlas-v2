import React, { useRef } from 'react';
import { useDrawingWorkspace } from '../../contexts/DrawingWorkspaceContext';
import { DrawingCanvas } from './DrawingCanvas';
import './DrawingViewport.css';

export const DrawingViewport: React.FC = () => {
  const { transform, setTransform } = useDrawingWorkspace();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isPanning = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return; // Permitir click izquierdo o rueda para pan
    isPanning.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    
    const deltaX = e.clientX - lastPoint.current.x;
    const deltaY = e.clientY - lastPoint.current.y;
    lastPoint.current = { x: e.clientX, y: e.clientY };

    setTransform(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isPanning.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); 
    if (!containerRef.current) return;

    // Constante de zoom estándar (10% por tic)
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Coordenadas relativas del mouse en el viewport (pantalla)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTransform(prev => {
      // Coordenadas lógicas en el espacio del dibujo antes del zoom
      const contentX = (mouseX - prev.x) / prev.scale;
      const contentY = (mouseY - prev.y) / prev.scale;

      const newScale = prev.scale * zoomFactor;

      // Calcular nuevo offset para mantener el 'contentX/Y' bajo el mouse
      const newX = mouseX - contentX * newScale;
      const newY = mouseY - contentY * newScale;

      return { x: newX, y: newY, scale: newScale };
    });
  };

  return (
    <div 
      className="drawing-viewport"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <DrawingCanvas />
    </div>
  );
};
