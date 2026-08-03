import React from 'react';
import { usePipelineContext } from '../../../contexts/PipelineContext';
import toast from 'react-hot-toast';

import { useProjectStore } from '../../../store/useProjectStore';

export const ProjectDashboard: React.FC = () => {
  const { pipelineResult } = usePipelineContext();
  const { projectInput, entities } = useProjectStore();

  if (!pipelineResult) {
    return <div style={{ padding: 20, color: '#8b949e', fontFamily: 'Inter' }}>No hay resultados disponibles en el sistema.</div>;
  }

  const { entityGraph, quote, manufacturingParts } = pipelineResult;
  const nodes = entityGraph ? Array.from(entityGraph.getNodes()) : [];

  const memberCount = nodes.filter((n: any) => n.type === 'Member').length;
  const connectionCount = nodes.filter((n: any) => n.type === 'Connection').length;
  const assemblyCount = nodes.filter((n: any) => n.type === 'Assembly').length;

  // Manufacturing stats
  const plates = manufacturingParts?.filter(p => p.profile.toLowerCase().includes('plate')).reduce((a: any, c: any) => a + c.quantity, 0) || 0;
  const bolts = manufacturingParts?.filter(p => p.profile.toLowerCase().includes('bolt') || p.profile.toLowerCase().includes('m')).reduce((a: any, c: any) => a + c.quantity, 0) || 0;
  const welds = manufacturingParts?.filter(p => p.profile.toLowerCase().includes('weld')).reduce((a: any, c: any) => a + c.quantity, 0) || 0;
  
  const totalLength = manufacturingParts?.reduce((a: any, c: any) => a + (c.length * c.quantity), 0) || 0;
  
  // Weights (assuming density if properties available, but we can fake it from CostEngine or just show 0 if not calc'd yet)
  const totalWeight = quote?.materialCosts?.reduce((a: any, c: any) => a + c.totalCost, 0) || 0; // Using cost as a proxy or we'd need volume

  const costMat = quote?.totalMaterialCost || 0;
  const costFab = quote?.totalOperationCost || 0;
  const costTotal = quote?.grandTotal || 0;

  // Calculate live weight based on store
  const WEIGHT_FACTORS: Record<string, number> = { 'Column': 35, 'Beam': 35, 'Purlin': 5, 'Bracing': 2 };
  let calcTotalWeight = 0;
  entities.forEach((e: any) => {
    const weightPerM = WEIGHT_FACTORS[e.type] || 10;
    calcTotalWeight += (e.length / 1000) * weightPerM;
  });
  const pricePerKg = projectInput.pricePerKg || 0;
  const calculatedCost = calcTotalWeight * pricePerKg;

  return (
    <div style={{ padding: 20, color: '#c9d1d9', fontFamily: 'Inter, sans-serif', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ color: '#fff', fontSize: 18, marginTop: 0, marginBottom: 20, borderBottom: '1px solid #30363d', paddingBottom: 8 }}>Métricas del Proyecto</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {/* Engineering */}
        <div style={{ background: '#0d1117', border: '1px solid #30363d', padding: 16, borderRadius: 6 }}>
          <h3 style={{ fontSize: 14, color: '#8b949e', marginTop: 0 }}>Ingeniería</h3>
          <p style={{ margin: '4px 0' }}>Elementos: <strong>{memberCount}</strong></p>
          <p style={{ margin: '4px 0' }}>Conexiones: <strong>{connectionCount}</strong></p>
          <p style={{ margin: '4px 0' }}>Ensambles: <strong>{assemblyCount}</strong></p>
          <p style={{ margin: '4px 0' }}>Longitud Total: <strong>{(totalLength / 1000).toFixed(2)} m</strong></p>
        </div>

        {/* Manufacturing */}
        <div style={{ background: '#0d1117', border: '1px solid #30363d', padding: 16, borderRadius: 6 }}>
          <h3 style={{ fontSize: 14, color: '#8b949e', marginTop: 0 }}>Fabricación</h3>
          <p style={{ margin: '4px 0' }}>Partes: <strong>{manufacturingParts?.length || 0}</strong></p>
          <p style={{ margin: '4px 0' }}>Chapas: <strong>{plates}</strong></p>
          <p style={{ margin: '4px 0' }}>Bulones: <strong>{bolts}</strong></p>
          <p style={{ margin: '4px 0' }}>Soldaduras: <strong>{welds}</strong></p>
        </div>

        {/* Costs */}
        <div style={{ background: '#0d1117', border: '1px solid #30363d', padding: 16, borderRadius: 6 }}>
          <h3 style={{ fontSize: 14, color: '#8b949e', marginTop: 0 }}>Costo Estimado</h3>
          <p style={{ margin: '4px 0' }}>Materiales: <strong>USD {costMat.toFixed(2)}</strong></p>
          <p style={{ margin: '4px 0' }}>Fabricación: <strong>USD {costFab.toFixed(2)}</strong></p>
          <div style={{ margin: '8px 0', borderTop: '1px solid #30363d' }}></div>
          <p style={{ margin: '4px 0', fontSize: '11px', color: '#8b949e' }}>Acero: {(calcTotalWeight / 1000).toFixed(2)}t @ ${pricePerKg}/kg</p>
          <p style={{ margin: '4px 0' }}>Presupuesto Estructural: <strong style={{ color: '#3fb950' }}>USD {calculatedCost.toFixed(2)}</strong></p>
        </div>
        
        {/* Deliverables */}
        <div style={{ background: '#0d1117', border: '1px solid #30363d', padding: 16, borderRadius: 6, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, color: '#8b949e', marginTop: 0 }}>Entregables</h3>
          <p style={{ fontSize: 12, color: '#8b949e' }}>Generar documentación técnica (BOM, Costos, Memorias) para el cliente.</p>
          <button 
            className="atlas-button primary"
            onClick={async () => {
              const { DeliverablesService } = await import('../../../services/DeliverablesService');
              const service = new DeliverablesService((e) => console.log('Deliverables Event:', e));
              
              service.publishAndDownload(pipelineResult, {
                includeBom: true,
                includeCostSummary: true,
                includeDescriptiveReport: true,
                includeCutList: false,
                includeExecutiveReport: true,
                includeDxfDwg: false,
                includePdf: false
              })
              .then(() => toast.success("Documentación Generada con Éxito"))
              .catch(err => toast.error("Error al generar los entregables: " + err.message));
            }}
          >
            Generar Documentación
          </button>
        </div>
      </div>
    </div>
  );
};
