import React from 'react';
import { usePipelineContext } from '../../../contexts/PipelineContext';

export const CostDashboard: React.FC = () => {
  const { pipelineResult } = usePipelineContext();
  const quote = pipelineResult?.quote;

  if (!quote) {
    return <div style={{ padding: 20, color: '#8b949e', fontFamily: 'Inter' }}>No hay datos de costos disponibles.</div>;
  }

  const matCost = quote.totalMaterialCost || 0;
  const opCost = quote.totalOperationCost || 0;
  const total = quote.grandTotal || 0;

  const matPct = total > 0 ? (matCost / total) * 100 : 0;
  const opPct = total > 0 ? (opCost / total) * 100 : 0;

  return (
    <div style={{ padding: 20, color: '#c9d1d9', fontFamily: 'Inter, sans-serif', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ color: '#fff', fontSize: 18, marginTop: 0, marginBottom: 20, borderBottom: '1px solid #30363d', paddingBottom: 8 }}>Análisis de Costos</h2>
      
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', padding: 20, borderRadius: 8 }}>
          <h3 style={{ marginTop: 0, fontSize: 14, color: '#8b949e' }}>Costo Total</h3>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#3fb950' }}>USD {total.toFixed(2)}</div>
        </div>
        
        <div style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', padding: 20, borderRadius: 8 }}>
          <h3 style={{ marginTop: 0, fontSize: 14, color: '#8b949e' }}>Materiales</h3>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>USD {matCost.toFixed(2)}</div>
        </div>

        <div style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', padding: 20, borderRadius: 8 }}>
          <h3 style={{ marginTop: 0, fontSize: 14, color: '#8b949e' }}>Fabricación</h3>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>USD {opCost.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 14, color: '#8b949e', marginBottom: 12 }}>Desglose de Costos</h3>
        
        {/* CSS Bar Chart */}
        <div style={{ display: 'flex', height: 24, borderRadius: 12, overflow: 'hidden', background: '#21262d', border: '1px solid #30363d' }}>
          <div style={{ width: `${matPct}%`, background: '#1f6feb', display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: 12, fontWeight: 'bold', color: '#fff' }}>
            {matPct > 5 && `Materiales ${matPct.toFixed(1)}%`}
          </div>
          <div style={{ width: `${opPct}%`, background: '#d29922', display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: 12, fontWeight: 'bold', color: '#fff' }}>
            {opPct > 5 && `Fabricación ${opPct.toFixed(1)}%`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#1f6feb' }}></div>
            <span>Materiales (USD {matCost.toFixed(2)})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#d29922' }}></div>
            <span>Operaciones de Fabricación (USD {opCost.toFixed(2)})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
