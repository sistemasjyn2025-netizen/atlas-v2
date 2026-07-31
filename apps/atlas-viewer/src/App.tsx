import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Grid, Environment, ContactShadows, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Toaster } from 'react-hot-toast';
import * as THREE from 'three';
import { useAuth } from '@clerk/clerk-react';
import { DataLoader } from './utils/DataLoader';
import type { SelectionMapping } from '@atlas/renderer-core';
import type { PipelineResult } from '@atlas/runtime';
import { AtlasPipeline } from '@atlas/runtime';
import { ThreeAdapter } from '@atlas/renderer-three-adapter';

import { ProjectContext } from './contexts/ProjectContext';
import { PipelineContext } from './contexts/PipelineContext';
import { SelectionContext } from './contexts/SelectionContext';
import { ViewportContext } from './contexts/ViewportContext';

import { Workspace } from './components/workspace/Workspace';
import { Ribbon } from './components/workspace/Ribbon';
import { StatusBar } from './components/workspace/StatusBar';
import { CommandPalette } from './components/workspace/CommandPalette';
import { SceneRenderer } from './components/SceneRenderer';
import { StartScreen } from './components/wizard/StartScreen';
import { PerformanceOverlay } from './components/workspace/PerformanceOverlay';
import { ReactivePipelineController } from './components/controllers/ReactivePipelineController';
import { SceneGraphManager } from './services/SceneGraphManager';
import { useProjectStore } from './store/useProjectStore';
import { WarehouseGenerator } from './components/3d/WarehouseGenerator';

export default function App() {
  const { setSelectedEntity, projectInput, setProjectInput } = useProjectStore();
  const [appState, setAppState] = useState<'START_SCREEN' | 'WORKSPACE'>('START_SCREEN');
  const [sceneGraphManager] = useState(() => new SceneGraphManager());
  const { getToken } = useAuth();

  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [selectionMap, setSelectionMap] = useState<Map<string, SelectionMapping>>(new Map());
  
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);
  const [hardwareLod, setHardwareLod] = useState<'auto' | 'low' | 'med' | 'high'>('auto');
  
  const [viewMode, setViewMode] = useState<'iso' | 'top' | 'front'>('iso');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDemoMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleProjectCreated = async (action: any) => {
    try {
      if (action.type === 'NEW') {
        const { wizardData, pipelineResult } = action.payload;
        sceneGraphManager.applyPipelineResult(pipelineResult);
        setSelectionMap(sceneGraphManager.selectionMap);
        setPipelineResult(pipelineResult);
        setProjectInput(wizardData);
        setAppState('WORKSPACE');
        setLoadError(null);
      } else if (action.type === 'LOAD') {
        const token = await getToken();
        if (!token) throw new Error("No estás logueado.");

        const res = await fetch(`/api/projects/${action.projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("No se pudo cargar el proyecto.");

        const data = await res.json();

        // Formatear los datos guardados para el motor de la misma forma que GenerationScreen
        const wizardData = data.inputData;
        
        // Ensure values are numbers to avoid string concatenation bugs in 3D generation
        const safeData = {
          ...wizardData,
          id: data.id,
          width: Number(wizardData.width) || 20000,
          length: Number(wizardData.length) || 30000,
          height: Number(wizardData.height) || 6000,
          roofSlope: Number(wizardData.roofSlope) || 0.15,
          baySpacing: Number(wizardData.baySpacing) || 5000
        };

        const projectFile = {
          version: '1.0',
          metadata: { id: data.id || 'custom', name: safeData.projectName },
          building: {
            width: safeData.width,
            length: safeData.length,
            height: safeData.height,
            baySpacing: safeData.baySpacing,
            roofType: 'gable' as const,
            roofSlope: safeData.roofSlope,
            structuralProfile: safeData.mainProfileId,
            frontGates: 2,
            rearGates: 2,
            sideGates: 1
          }
        };

        const pipeline = new AtlasPipeline();
        const pipelineResult = await pipeline.execute(projectFile as any);
        
        if (!pipelineResult.success) {
           throw new Error("Error en pipeline: " + (pipelineResult.errors || []).join(', '));
        }

        sceneGraphManager.applyPipelineResult(pipelineResult);
        setSelectionMap(sceneGraphManager.selectionMap);
        setPipelineResult(pipelineResult);
        
        setProjectInput(safeData);
        setAppState('WORKSPACE');
        setLoadError(null);
      }
    } catch (e: any) {
      console.error(e);
      if (appState === 'START_SCREEN') {
        alert(e.message || "Failed to load project");
      } else {
        setLoadError(e.message || "Failed to load project");
      }
    }
  };

  const updateProjectInput = (partial: any) => {
    setProjectInput(partial);
  };

  const handlePipelineComplete = (result: PipelineResult) => {
    try {
      sceneGraphManager.applyPipelineResult(result);
      
      setSelectionMap(sceneGraphManager.selectionMap);
      setLoadError(null);
      
      // Preserve selection logically if it still exists
      setSelectedEntityId(currentId => {
        if (!currentId) return null;
        // Search new selection map for this entity id
        let found = false;
        for (const [key, mapping] of sceneGraphManager.selectionMap.entries()) {
          if (mapping.sourceEntityId === currentId) {
            found = true;
            break;
          }
        }
        return found ? currentId : null;
      });
    } catch (e: any) {
      console.error(e);
      setLoadError(e.message || "Failed to render project");
    }
  };

  if (appState === 'START_SCREEN') {
    return <StartScreen onProjectCreated={handleProjectCreated} />;
  }

  const viewportComponent = (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas 
        style={{ background: 'var(--surface-primary)', display: 'block', width: '100%', height: '100%' }} 
        shadows 
        gl={{ antialias: true, toneMappingExposure: 1.2 }}
        onPointerMissed={() => setSelectedEntity(null)}
      >
        <ambientLight intensity={0.4} color="#e6edf3" />
        <directionalLight position={[10000, 20000, 10000]} intensity={2.0} color="#ffffff" castShadow shadow-mapSize={[4096, 4096]} shadow-camera-near={100} shadow-camera-far={400000} shadow-camera-left={-100000} shadow-camera-right={100000} shadow-camera-top={100000} shadow-camera-bottom={-100000} shadow-bias={-0.0001} />
        <directionalLight position={[-10000, 10000, -10000]} intensity={0.5} color="#58a6ff" />
        
        <Environment preset="city" />
        <ContactShadows resolution={2048} scale={300000} blur={2.5} opacity={0.7} far={100000} color="#010409" position={[0, -10, 0]} />

        <Grid infiniteGrid fadeDistance={300000} cellColor="#30363d" sectionColor="#58a6ff" sectionSize={10000} cellSize={1000} position={[0, 0, 0]} />
        
        {viewMode === 'iso' && <PerspectiveCamera makeDefault position={[90000, 70000, 90000]} near={100} far={1000000} fov={50} />}
        {viewMode === 'top' && <OrthographicCamera makeDefault position={[0, 200000, 0]} near={1} far={1000000} zoom={0.008} />}
        {viewMode === 'front' && <OrthographicCamera makeDefault position={[0, 0, 200000]} near={1} far={1000000} zoom={0.008} />}
        
        <OrbitControls makeDefault />
        <SceneRenderer sceneGroup={sceneGraphManager.group} />
        <WarehouseGenerator />

        {!demoMode && (
          <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
            <GizmoViewport axisColors={['#f85149', '#3fb950', '#58a6ff']} labelColor="white" />
          </GizmoHelper>
        )}
        {!demoMode && <PerformanceOverlay />}
      </Canvas>
    </div>
  );

  return (
    <ProjectContext.Provider value={{ projectInput, updateProjectInput }}>
      <ReactivePipelineController onPipelineComplete={handlePipelineComplete}>
        <ViewportContext.Provider value={{ hardwareLod, setHardwareLod, selectionMap, viewMode, setViewMode }}>
          <SelectionContext.Provider value={{ selectedEntityId, setSelectedEntityId, hoveredEntityId, setHoveredEntityId }}>
            <div className="atlas-app-container">
              {!demoMode && <Ribbon />}
              
              {loadError && !demoMode && (
                <div className="atlas-error-banner">
                  <strong>Pipeline Error:</strong> {loadError}
                </div>
              )}

              <Toaster position="bottom-right" toastOptions={{ style: { background: '#161b22', color: '#c9d1d9', border: '1px solid #30363d' } }} />

              <Workspace viewportComponent={viewportComponent} demoMode={demoMode} />

              {!demoMode && <StatusBar />}
              <CommandPalette />
            </div>
          </SelectionContext.Provider>
        </ViewportContext.Provider>
      </ReactivePipelineController>
    </ProjectContext.Provider>
  );
}
