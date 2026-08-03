import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Grid, Environment, ContactShadows, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Toaster } from 'sonner';
import * as THREE from 'three';
import { useAuth } from '@clerk/clerk-react';
import { DataLoader } from './utils/DataLoader';
import { loadProject, loadSharedProject } from './services/api';
import type { SelectionMapping } from '@atlas/renderer-core';
import type { PipelineResult } from '@atlas/runtime';
import { AtlasPipeline } from '@atlas/runtime';
import { ThreeAdapter } from '@atlas/renderer-three-adapter';

class CanvasErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Canvas Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: 20, background: '#111', width: '100%', height: '100%', overflow: 'auto' }}>
          <h2>Canvas Crash!</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre style={{ fontSize: '10px' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

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
import { CameraController } from './components/3d/CameraController';

export default function App() {
  const { setSelectedEntity, projectInput, setProjectInput, setHydratedProject, isReadOnly, setReadOnly, cameraView } = useProjectStore();
  const [appState, setAppState] = useState<'START_SCREEN' | 'WORKSPACE' | 'LOADING'>('START_SCREEN');
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

  React.useEffect(() => {
    const matchApp = window.location.pathname.match(/\/app\/projects\/([a-zA-Z0-9-]+)/);
    const matchView = window.location.pathname.match(/\/view\/([a-zA-Z0-9-]+)/);
    
    if (matchApp || matchView) {
      const isViewMode = !!matchView;
      const projectId = matchApp ? matchApp[1] : matchView![1];
      
      setAppState('LOADING');
      setReadOnly(isViewMode);
      
      const loadFn = isViewMode 
        ? () => loadSharedProject(projectId)
        : async () => {
            const token = await getToken();
            if (!token) throw new Error("No estás logueado.");
            return loadProject(projectId, token);
          };

      loadFn().then(async (data) => {
        
        const wizardData = data.inputData;
        const { entities, ...restData } = wizardData;

        const safeData = {
          ...restData,
          id: data.id,
          width: Number(restData.width) || 20000,
          length: Number(restData.length) || 30000,
          height: Number(restData.height) || 6000,
          roofSlope: Number(restData.roofSlope) || 0.15,
          baySpacing: Number(restData.baySpacing) || 5000,
          pricePerKg: Number(restData.pricePerKg) || 2.5
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

        if (entities && entities.length > 0) {
          setHydratedProject(safeData, entities);
        } else {
          setProjectInput(safeData);
        }
        
        setAppState('WORKSPACE');
      }).catch(err => {
        console.error(err);
        setAppState('START_SCREEN');
      });
    }
  }, [getToken, sceneGraphManager, setReadOnly]);

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
        window.history.pushState(null, '', `/app/projects/${action.projectId}`);
        
        const token = await getToken();
        if (!token) throw new Error("No estás logueado.");

        const data = await loadProject(action.projectId, token);

        const wizardData = data.inputData;
        const { entities, ...restData } = wizardData;
        
        const safeData = {
          ...restData,
          id: data.id,
          width: Number(restData.width) || 20000,
          length: Number(restData.length) || 30000,
          height: Number(restData.height) || 6000,
          roofSlope: Number(restData.roofSlope) || 0.15,
          baySpacing: Number(restData.baySpacing) || 5000,
          pricePerKg: Number(restData.pricePerKg) || 2.5
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
        
        if (entities && entities.length > 0) {
          setHydratedProject(safeData, entities);
        } else {
          setProjectInput(safeData);
        }
        
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

  if (appState === 'LOADING') {
    return (
      <div style={{width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', alignItems: 'center', background: '#010409', color: '#c9d1d9', fontFamily: 'Inter, sans-serif'}}>
        <div style={{ width: 40, height: 40, border: '3px solid #30363d', borderTopColor: '#58a6ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        <span>Reconstruyendo modelo...</span>
      </div>
    );
  }

  const viewportComponent = (
    <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1, display: 'flex' }}>
      <CanvasErrorBoundary>
        <Canvas 
          style={{ background: '#1e1e1e', display: 'block', width: '100%', height: '100%' }} 
          shadows 
          gl={{ antialias: true, toneMappingExposure: 1.2 }}
          onPointerMissed={() => setSelectedEntity(null)}
        >
        <ambientLight intensity={0.4} />
        <directionalLight position={[100, 100, 50]} intensity={1.5} color="#ffffff" castShadow shadow-mapSize={[4096, 4096]} shadow-camera-near={100} shadow-camera-far={400000} shadow-camera-left={-100000} shadow-camera-right={100000} shadow-camera-top={100000} shadow-camera-bottom={-100000} shadow-bias={-0.0001} />
        
        <Environment preset="city" />
        <ContactShadows resolution={2048} scale={300000} blur={2.5} opacity={0.7} far={100000} color="#010409" position={[0, -10, 0]} />

        <Grid infiniteGrid fadeDistance={300000} cellColor="#444444" sectionColor="#666666" sectionSize={10000} cellSize={1000} position={[0, 0, 0]} />
        
        {cameraView === 'iso' && <PerspectiveCamera makeDefault position={[90000, 70000, 90000]} near={100} far={1000000} fov={50} />}
        {cameraView === 'top' && <OrthographicCamera makeDefault position={[0, 200000, 0]} near={1} far={1000000} zoom={0.008} />}
        {cameraView === 'front' && <OrthographicCamera makeDefault position={[0, 0, 200000]} near={1} far={1000000} zoom={0.008} />}
        
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
      </CanvasErrorBoundary>
    </div>
  );

  return (
    <ProjectContext.Provider value={{ projectInput, updateProjectInput }}>
      <ReactivePipelineController onPipelineComplete={handlePipelineComplete}>
        <ViewportContext.Provider value={{ hardwareLod, setHardwareLod, selectionMap, viewMode, setViewMode }}>
          <SelectionContext.Provider value={{ selectedEntityId, setSelectedEntityId, hoveredEntityId, setHoveredEntityId }}>
            <div className="atlas-app-container">
              {!demoMode && !isReadOnly && <Ribbon />}
              
              {loadError && !demoMode && (
                <div className="atlas-error-banner">
                  <strong>Pipeline Error:</strong> {loadError}
                </div>
              )}

              <Toaster position="bottom-right" theme="dark" richColors />

              <Workspace viewportComponent={viewportComponent} demoMode={demoMode || isReadOnly} />

              {!demoMode && !isReadOnly && <StatusBar />}
              {!isReadOnly && <CommandPalette />}
            </div>
          </SelectionContext.Provider>
        </ViewportContext.Provider>
      </ReactivePipelineController>
    </ProjectContext.Provider>
  );
}
