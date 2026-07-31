import React, { useEffect, useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Activity } from 'lucide-react';
import { Html } from '@react-three/drei';

export const PerformanceOverlay: React.FC = () => {
  const { gl } = useThree();
  const [stats, setStats] = useState({
    fps: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0
  });
  const [visible, setVisible] = useState(true);

  const frames = useRef(0);
  const prevTime = useRef(performance.now());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        setVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useFrame(() => {
    if (!visible) return;
    
    frames.current++;
    const time = performance.now();
    
    if (time >= prevTime.current + 500) {
      const fps = Math.round((frames.current * 1000) / (time - prevTime.current));
      frames.current = 0;
      prevTime.current = time;

      setStats({
        fps,
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries
      });
    }
  });

  if (!visible) return null;

  return (
    <Html>
      <div style={{
        position: 'fixed',
        top: 16,
        right: 16,
        background: 'rgba(13, 17, 23, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #30363d',
        borderRadius: 8,
        padding: '16px',
        color: '#c9d1d9',
        fontFamily: 'Inter, monospace',
        fontSize: 12,
        minWidth: 220,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #30363d', paddingBottom: 12, marginBottom: 12 }}>
          <Activity size={16} color="#3fb950" />
          <span style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>Performance</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px 16px' }}>
          <span style={{ color: '#8b949e' }}>FPS</span>
          <span style={{ color: stats.fps >= 55 ? '#3fb950' : stats.fps >= 30 ? '#d29922' : '#f85149', fontWeight: 600 }}>{stats.fps}</span>
          
          <span style={{ color: '#8b949e' }}>Draw Calls</span>
          <span style={{ color: '#58a6ff' }}>{stats.drawCalls}</span>
          
          <span style={{ color: '#8b949e' }}>Triangles</span>
          <span style={{ color: '#e3b341' }}>{stats.triangles.toLocaleString()}</span>
          
          <span style={{ color: '#8b949e' }}>Geometries</span>
          <span style={{ color: '#c9d1d9' }}>{stats.geometries}</span>
        </div>
      </div>
    </Html>
  );
};
