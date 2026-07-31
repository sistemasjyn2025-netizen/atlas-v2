import React, { useState } from 'react';
import { usePipelineContext } from '../contexts/PipelineContext';
import { useSelectionContext } from '../contexts/SelectionContext';

export function ViewerSearch() {
  const { pipelineResult } = usePipelineContext();
  const { setSelectedEntityId } = useSelectionContext();
  const [query, setQuery] = useState('');

  if (!pipelineResult || !pipelineResult.entityGraph) return null;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  let results: any[] = [];
  if (query.trim().length > 1) {
    const q = query.toLowerCase();
    const parts = pipelineResult.manufacturingParts || [];
    const matchedParts = parts.filter(p => p.name.toLowerCase().includes(q) || p.profile.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    
    results = matchedParts.map(p => ({
      id: p.sourceEntityIds?.[0] || p.id,
      label: `${p.name} (${p.profile})`,
      type: 'Part'
    })).slice(0, 10);
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#1e1e1e',
      padding: '8px',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      <input 
        type="text" 
        placeholder="Search profiles, materials..." 
        value={query}
        onChange={handleSearch}
        style={{
          width: '100%',
          padding: '8px',
          background: 'rgba(30,30,46,0.9)',
          border: '1px solid #444',
          color: 'white',
          borderRadius: '4px',
          boxSizing: 'border-box'
        }}
      />
      {results.length > 0 && (
        <div style={{
          background: 'rgba(30,30,46,0.95)',
          border: '1px solid #444',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {results.map((r, i) => (
            <div 
              key={i}
              onClick={() => {
                setSelectedEntityId(r.id);
                setQuery('');
              }}
              style={{
                padding: '6px 10px',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer',
                borderBottom: '1px solid #333'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#334')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <strong>{r.type}</strong>: {r.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
