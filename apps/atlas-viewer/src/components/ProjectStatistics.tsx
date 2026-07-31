import React, { useMemo } from 'react';
import { usePipelineContext } from '../contexts/PipelineContext';

export function ProjectStatistics() {
  const { pipelineResult } = usePipelineContext();

  const stats = useMemo(() => {
    if (!pipelineResult) return null;
    return {
      steelWeight: pipelineResult.bom?.totalEstimatedWeightKg || 0,
      assemblies: pipelineResult.summary?.totalAssemblies || 0,
      components: pipelineResult.summary?.totalComponents || 0,
      parts: pipelineResult.summary?.totalManufacturingParts || 0,
      cost: pipelineResult.quote?.totalEstimatedCost || 0,
    };
  }, [pipelineResult]);

  if (!stats) return null;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#1e1e1e',
      padding: '16px',
      color: 'white',
      fontFamily: 'sans-serif',
      fontSize: '12px',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #555', paddingBottom: '4px' }}>Project Statistics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>Total Weight:</div>
        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{stats.steelWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</div>
        <div>Assemblies:</div>
        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{stats.assemblies}</div>
        <div>Components:</div>
        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{stats.components}</div>
        <div>Mfg Parts:</div>
        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{stats.parts}</div>
        <div>Est. Cost:</div>
        <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#8f8' }}>${stats.cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
      </div>
    </div>
  );
}
