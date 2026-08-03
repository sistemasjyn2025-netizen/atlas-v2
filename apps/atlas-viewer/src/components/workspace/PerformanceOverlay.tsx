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
  const [visible, setVisible] = useState(false);

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

  const [minimized, setMinimized] = useState(true);

  if (!visible) return null;

  return (
    <Html portal={{ current: gl.domElement.parentNode as HTMLElement }}>
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(13, 17, 23, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #30363d',
        borderRadius: 8,
        padding: minimized ? '8px 12px' : '16px',
        color: '#c9d1d9',
        fontFamily: 'Inter, monospace',
        fontSize: 12,
        minWidth: minimized ? 'auto' : 220,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: minimized ? 'none' : '1px solid #30363d', paddingBottom: minimized ? 0 : 12, marginBottom: minimized ? 0 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="#3fb950" />
            <span style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>Performance</span>
          </div>
          <button 
            onClick={() => setMinimized(!minimized)}
            style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 0 }}
          >
            {minimized ? '+' : '-'}
          </button>
        </div>
        
        {!minimized && (
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
        )}
      </div>
    </Html>
  );
};
