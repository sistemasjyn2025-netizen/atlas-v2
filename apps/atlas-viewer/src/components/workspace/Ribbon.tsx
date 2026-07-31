import React from 'react'; // Force HMR
import { useProjectContext } from '../../contexts/ProjectContext';
import { usePipelineContext } from '../../contexts/PipelineContext';
import { useViewportContext } from '../../contexts/ViewportContext';
import { useDeliverablesExport } from '../../hooks/useDeliverablesExport';
import { Save, FileDown, Eye, Maximize, Grid3X3, Axis3d, Settings, Crosshair, Loader2 } from 'lucide-react';
import { Button } from '../../design-system/Button';
import { useSaveProject } from '../../hooks/useSaveProject';
import { useProjectStore } from '../../store/useProjectStore';
import { generateDXF } from '../../utils/dxfGenerator';
import { generateBOM } from '../../utils/pdfGenerator';
import './RibbonStatusBar.css';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export const Ribbon = () => {
  const { projectInput } = useProjectContext();
  const { pipelineResult } = usePipelineContext();
  const { viewMode, setViewMode } = useViewportContext();
  const { exportPdf, isExporting } = useDeliverablesExport();
  const { entities } = useProjectStore();

  const handleExportPDF = () => {
    if (!projectInput) return;
    generateBOM(entities, projectInput);
  };

  const onPlaceholder = (action: string) => {
    alert(`[Placeholder] ${action} executed.`);
  };

  const handleExportDXF = () => {
    const dxfString = generateDXF(entities);
    const blob = new Blob([dxfString], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proyecto-atlas.dxf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const { saveProject: executeSave, isLoading: isSaving } = useSaveProject();

  const handleSave = async () => {
    if (!pipelineResult || !projectInput) {
      alert('No hay datos de proyecto para guardar.');
      return;
    }
    
    // Extraemos el ID actual de la URL de forma silenciosa (ej: /app/projects/uuid)
    const match = window.location.pathname.match(/\/projects\/([a-zA-Z0-9-]+)/);
    const currentId = match ? match[1] : undefined;

    await executeSave({
      id: currentId,
      name: projectInput.projectName || 'Industrial Warehouse',
      inputData: projectInput
    });
  };

  return (
    <div className="atlas-ribbon-container">
      
      {/* Menu Bar */}
      <div className="atlas-ribbon-menu">
        <div 
          className="atlas-ribbon-menu-item atlas-ribbon-menu-brand"
          onClick={() => window.location.href = '/'}
          style={{ cursor: 'pointer' }}
          title="Ir al Inicio"
        >
          ATLAS
        </div>
        <div className="atlas-ribbon-menu-item">Archivo</div>
        <div className="atlas-ribbon-menu-item">Proyecto</div>
        <div className="atlas-ribbon-menu-item">Ver</div>
        <div className="atlas-ribbon-menu-item">Ingeniería</div>
        <div className="atlas-ribbon-menu-item">Manufactura</div>
        <div className="atlas-ribbon-menu-item">Documentación</div>
        <div className="atlas-ribbon-menu-item">Herramientas</div>
        <div className="atlas-ribbon-menu-item">Ayuda</div>
        
        <div style={{ marginLeft: 'auto', paddingRight: '1rem', display: 'flex', alignItems: 'center' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="primary" size="sm">Iniciar Sesión</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* Toolbar */}
      <div className="atlas-ribbon-toolbar">
        <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving} icon={isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}>
          {isSaving ? 'Guardando...' : 'Guardar .atlas'}
        </Button>
        <div className="atlas-ribbon-divider" />
        <Button variant="secondary" size="sm" onClick={handleExportPDF} icon={<FileDown size={14} />}>PDF</Button>
        <Button variant="secondary" size="sm" onClick={handleExportDXF} icon={<FileDown size={14} />}>DXF</Button>
        <div className="atlas-ribbon-divider" />
        <Button variant={viewMode === 'top' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('top')} icon={<Eye size={14} />}>Superior</Button>
        <Button variant={viewMode === 'front' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('front')} icon={<Eye size={14} />}>Frontal</Button>
        <Button variant={viewMode === 'iso' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('iso')} icon={<Eye size={14} />}>Iso</Button>
        <div className="atlas-ribbon-divider" />
        <Button variant="secondary" size="sm" onClick={() => onPlaceholder('Toggle Grid')} icon={<Grid3X3 size={14} />}>Rejilla</Button>
        <Button variant="secondary" size="sm" onClick={() => onPlaceholder('Toggle Axes')} icon={<Axis3d size={14} />}>Ejes</Button>
        <div className="atlas-ribbon-divider" />
        <Button variant="secondary" size="sm" onClick={() => onPlaceholder('Hardware LOD')} icon={<Settings size={14} />}>Nivel de Detalle</Button>
        <Button variant="secondary" size="sm" onClick={() => onPlaceholder('Zoom Extents')} icon={<Crosshair size={14} />}>Centrar</Button>
      </div>
    </div>
  );
};
