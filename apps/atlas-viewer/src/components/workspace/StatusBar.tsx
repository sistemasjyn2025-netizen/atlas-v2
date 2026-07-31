import React from 'react';
import { usePipelineContext } from '../../contexts/PipelineContext';
import { useSelectionContext } from '../../contexts/SelectionContext';
import './RibbonStatusBar.css';

export function StatusBar() {
  const { pipelineResult } = usePipelineContext();
  const { selectedEntityId } = useSelectionContext();

  let entityCount = 0;
  if (pipelineResult && pipelineResult.entityGraph) {
    try {
      const nodes = Array.from(pipelineResult.entityGraph.getNodes());
      entityCount = nodes.filter((n: any) => n.type === 'Member' || n.type === 'Assembly').length;
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="atlas-status-bar">
      <div className="atlas-status-bar-section">
        <span>Ready</span>
        <span>|</span>
        <span>Entities: {entityCount}</span>
        {selectedEntityId && (
          <>
            <span>|</span>
            <span>Selected: {selectedEntityId}</span>
          </>
        )}
      </div>
      <div className="atlas-status-bar-section">
        <span>Project Version: 1.0</span>
        <span>Atlas Engine v1.0</span>
      </div>
    </div>
  );
}
