import React, { useRef, useState, useEffect } from 'react';
import { Layout, Model, TabNode } from 'flexlayout-react';
import { ProjectTree } from '../ProjectTree';
import { InspectorPanel } from '../InspectorPanel';
import { ConsolePanel } from '../panels/ConsolePanel';
import { ViewerSearch } from '../ViewerSearch';
import { ProjectStatistics } from '../ProjectStatistics';
import { ProjectDashboard } from './tabs/ProjectDashboard';
import { BOMTable } from './tabs/BOMTable';
import { CostDashboard } from './tabs/CostDashboard';
import { ParametricPanel } from './ParametricPanel';
import { DrawingWorkspace } from '../presentation-engine/DrawingWorkspace';
import { useDrawingEngine } from '../presentation-engine/controllers/useDrawingEngine';

interface WorkspaceProps {
  viewportComponent: React.ReactNode;
  demoMode: boolean;
}

const defaultLayout = {
  global: {
    tabEnableClose: true,
    tabSetEnableDrop: true,
    tabSetEnableMaximize: true,
    borderBarSize: 24,
    splitterSize: 4,
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 20,
        selected: 0,
        children: [
          { type: "tab", name: "Explorador del Proyecto", component: "ProjectTree" },
          { type: "tab", name: "Parámetros", component: "Parametric" },
          { type: "tab", name: "Búsqueda", component: "Search" }
        ]
      },
      {
        type: "row",
        weight: 60,
        children: [
          {
            type: "tabset",
            weight: 70,
            selected: 0,
            children: [
              { type: "tab", name: "Modelo 3D", component: "Viewport", enableClose: false },
              { type: "tab", name: "Planos", component: "Drawings", enableClose: false }
            ]
          },
          {
            type: "tabset",
            weight: 30,
            selected: 0,
            children: [
              { type: "tab", name: "Métricas", component: "Dashboard" },
              { type: "tab", name: "Materiales (BOM)", component: "BOM" },
              { type: "tab", name: "Costos", component: "Cost" },
              { type: "tab", name: "Consola", component: "Console" }
            ]
          }
        ]
      },
      {
        type: "tabset",
        weight: 20,
        selected: 0,
        children: [
          { type: "tab", name: "Propiedades", component: "Inspector" }
        ]
      }
    ]
  }
};

export const Workspace: React.FC<WorkspaceProps> = ({ viewportComponent, demoMode }) => {
  const [model] = useState(() => Model.fromJson(defaultLayout as any));
  const layoutRef = useRef<any>(null);

  const { sheets, svgContentRecord, dxfContentRecord, isGenerating } = useDrawingEngine();

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case 'ProjectTree': return <ProjectTree />;
      case 'Parametric': return <ParametricPanel />;
      case 'Inspector': return <InspectorPanel />;
      case 'Console': return <ConsolePanel />;
      case 'Search': return <ViewerSearch />;
      case 'Statistics': return <ProjectStatistics />;
      case 'Dashboard': return <ProjectDashboard />;
      case 'BOM': return <BOMTable />;
      case 'Cost': return <CostDashboard />;
      case 'Viewport': return <>{viewportComponent}</>;
      case 'Drawings': return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {isGenerating && (
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 100, background: 'var(--surface-overlay)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-overlay)', backdropFilter: 'blur(8px)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Generando Planos...
            </div>
          )}
          <DrawingWorkspace 
            sheets={sheets} 
            svgContentRecord={svgContentRecord}
            dxfContentRecord={dxfContentRecord}
          />
        </div>
      );
      default: return <div>Missing {component}</div>;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (layoutRef.current) {
        // Force FlexLayout to update
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (demoMode) {
    return (
      <div className="atlas-workspace demo-mode-active" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {viewportComponent}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--surface-overlay)',
          color: 'var(--text-primary)',
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          pointerEvents: 'none',
          zIndex: 10000,
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(4px)'
        }}>
          MODO DEMO
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }} className="atlas-workspace">
      <Layout ref={layoutRef} model={model} factory={factory} />
    </div>
  );
};
