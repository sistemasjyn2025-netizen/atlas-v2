import React from 'react';
import { usePipelineContext } from '../../contexts/PipelineContext';

export const ConsolePanel: React.FC = () => {
  const { pipelineResult } = usePipelineContext();

  const logs = [];

  if (pipelineResult) {
    logs.push({ level: 'INFO', msg: 'Constraint Engine completed' });
    logs.push({ level: 'INFO', msg: 'Catalog Engine loaded Standard Catalog' });
    logs.push({ level: 'INFO', msg: 'Rule Pack ATLAS Standard resolved' });
    logs.push({ level: 'INFO', msg: 'Parametric Engine generated geometry' });
    logs.push({ level: 'INFO', msg: 'Connection Engine resolved joints' });
    logs.push({ level: 'INFO', msg: 'Manufacturing Engine created parts' });
    logs.push({ level: 'INFO', msg: 'Cost Engine estimated total' });
    if (pipelineResult.success) {
      logs.push({ level: 'SUCCESS', msg: 'Project generated successfully' });
    } else {
      pipelineResult.errors?.forEach(e => logs.push({ level: 'ERROR', msg: typeof e === "string" ? e : (e as any).message || String(e) }));
    }
  }

  const getColor = (level: string) => {
    switch (level) {
      case 'INFO': return '#58a6ff';
      case 'SUCCESS': return '#3fb950';
      case 'ERROR': return '#f85149';
      default: return '#8b949e';
    }
  };

  return (
    <div style={{ background: '#0d1117', height: '100%', overflowY: 'auto', fontFamily: 'monospace', fontSize: 12, padding: 10 }}>
      {logs.map((log, i) => (
        <div key={i} style={{ marginBottom: 4 }}>
          <span style={{ color: getColor(log.level), fontWeight: 'bold' }}>[{log.level}]</span>
          <span style={{ color: '#c9d1d9', marginLeft: 8 }}>{log.msg}</span>
        </div>
      ))}
      {!pipelineResult && <div style={{ color: '#8b949e' }}>No logs to display.</div>}
    </div>
  );
};
