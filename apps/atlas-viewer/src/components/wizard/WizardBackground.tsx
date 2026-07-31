import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

export const WizardBackground: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 0,
      background: 'radial-gradient(circle at 50% 50%, #161b22 0%, #010409 100%)',
      opacity: 0.8,
      pointerEvents: 'none' // Don't block interactions
    }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[50, 40, 50]} near={1} far={1000} fov={45} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[100, 100, 50]} intensity={0.5} />
        
        {/* Subtle technical grid */}
        <gridHelper args={[200, 40, 0x3d444d, 0x1c2128]} position={[0, -10, 0]} />
        
        {/* Abstract blurry industrial shape */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[30, 20, 40]} />
          <meshBasicMaterial color={0x21262d} wireframe transparent opacity={0.15} />
        </mesh>
        
        <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} enablePan={false} />
      </Canvas>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backdropFilter: 'blur(8px)',
        zIndex: 1
      }} />
    </div>
  );
};
