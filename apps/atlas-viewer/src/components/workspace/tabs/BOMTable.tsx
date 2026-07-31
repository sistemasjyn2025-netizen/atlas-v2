import React, { useState, useMemo } from 'react';
import { usePipelineContext } from '../../../contexts/PipelineContext';

export const BOMTable: React.FC = () => {
  const { pipelineResult } = usePipelineContext();
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('profile');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const parts = pipelineResult?.manufacturingParts || [];

  const data = useMemo(() => {
    let filtered = parts.map(p => {
      // Mock weight based on profile (kg/m)
      let kgPerM = 30;
      const prof = p.profile.toUpperCase();
      if (prof.includes('HEB 200')) kgPerM = 61.3;
      else if (prof.includes('HEB 300')) kgPerM = 117;
      else if (prof.includes('IPE 200')) kgPerM = 22.4;
      else if (prof.includes('IPE 300')) kgPerM = 42.2;
      else if (prof.includes('IPE 400')) kgPerM = 66.3;
      
      const weight = (p.length / 1000) * kgPerM;
      const totalWeight = weight * p.quantity;
      return { ...p, weight, totalWeight };
    }).filter(p => p.profile.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => {
      let valA = (a as any)[sortCol];
      let valB = (b as any)[sortCol];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [parts, search, sortCol, sortAsc]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #30363d', cursor: 'pointer', userSelect: 'none', color: '#8b949e', fontWeight: 600, fontSize: 12
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0d1117', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center' }}>
        <input 
          type="search" 
          placeholder="Buscar Materiales..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '6px 12px', background: '#010409', border: '1px solid #30363d', color: '#c9d1d9', borderRadius: 4, outline: 'none', width: 250 }}
        />
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#8b949e' }}>
          {data.length} elementos | Total: {data.reduce((acc, curr) => acc + curr.totalWeight, 0).toFixed(2)} kg
        </div>
      </div>
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: '#c9d1d9' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#0d1117', zIndex: 1 }}>
            <tr>
              <th style={thStyle} onClick={() => toggleSort('id')}>ID {sortCol === 'id' && (sortAsc ? '↑' : '↓')}</th>
              <th style={thStyle} onClick={() => toggleSort('profile')}>Perfil {sortCol === 'profile' && (sortAsc ? '↑' : '↓')}</th>
              <th style={thStyle} onClick={() => toggleSort('length')}>Longitud (mm) {sortCol === 'length' && (sortAsc ? '↑' : '↓')}</th>
              <th style={thStyle} onClick={() => toggleSort('quantity')}>Cant {sortCol === 'quantity' && (sortAsc ? '↑' : '↓')}</th>
              <th style={thStyle} onClick={() => toggleSort('totalWeight')}>Peso Total (kg) {sortCol === 'totalWeight' && (sortAsc ? '↑' : '↓')}</th>
              <th style={thStyle}>Operaciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map(p => (
              <tr 
                key={p.id} 
                onClick={() => setSelectedRow(p.id)}
                style={{ 
                  background: selectedRow === p.id ? '#1f6feb33' : 'transparent',
                  borderBottom: '1px solid #21262d',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = selectedRow === p.id ? '#1f6feb33' : '#161b22')}
                onMouseLeave={e => (e.currentTarget.style.background = selectedRow === p.id ? '#1f6feb33' : 'transparent')}
              >
                <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{p.id.substring(0, 8)}...</td>
                <td style={{ padding: '8px 12px' }}>{p.profile}</td>
                <td style={{ padding: '8px 12px' }}>{p.length.toFixed(2)}</td>
                <td style={{ padding: '8px 12px' }}>{p.quantity}</td>
                <td style={{ padding: '8px 12px' }}>{p.totalWeight.toFixed(2)}</td>
                <td style={{ padding: '8px 12px' }}>{p.operations.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#8b949e' }}>No se encontraron elementos.</div>}
      </div>
    </div>
  );
};
