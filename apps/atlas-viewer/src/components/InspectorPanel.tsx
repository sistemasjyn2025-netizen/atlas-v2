import React from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { X, Search } from 'lucide-react';
import { Panel } from '../design-system/Panel';
import { EmptyState } from '../design-system/EmptyState';

export function InspectorPanel() {
  const { entities, selectedEntityId, setSelectedEntity } = useProjectStore();

  if (!selectedEntityId) return (
    <Panel noPadding>
      <EmptyState 
        icon={<Search size={32} />} 
        title="Sin Selección" 
        description="Seleccione una entidad en el visor para inspeccionar sus propiedades." 
      />
    </Panel>
  );

  const entity = entities.find(e => e.id === selectedEntityId);

  if (!entity) return (
    <Panel title="Propiedades" headerAction={<X size={14} style={{ cursor: 'pointer' }} onClick={() => setSelectedEntity(null)} />}>
      <div style={{ padding: '16px', color: 'var(--text-tertiary)' }}>Entidad no encontrada.</div>
    </Panel>
  );

  // Estimación de peso burda: ~50kg por metro lineal para columnas, 40kg para vigas
  const linearWeight = entity.type === 'Column' ? 50 : 40;
  const lengthMeters = entity.length / 1000;
  const weightKg = (lengthMeters * linearWeight).toFixed(1);

  return (
    <Panel 
      title="Propiedades" 
      headerAction={<X size={14} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={() => setSelectedEntity(null)} />}
    >
      <div style={{ padding: 'var(--space-4)', color: 'var(--text-primary)' }}>
        <h4 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          {entity.name}
        </h4>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>ID</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'monospace' }}>{entity.id}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Tipo</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>{entity.type}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Material</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>{entity.material}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Longitud (mm)</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>{entity.length}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Peso Est. (kg)</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>{weightKg} kg</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
