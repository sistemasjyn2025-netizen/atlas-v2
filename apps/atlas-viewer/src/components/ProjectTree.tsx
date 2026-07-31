import React, { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { ChevronRight, ChevronDown, Box, Columns, Link2, Layers } from 'lucide-react';
import './ProjectTree.css';

export function ProjectTree() {
  const { entities, selectedEntityId, setSelectedEntity } = useProjectStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // Group entities by parent
  const porticos = entities.reduce((acc: any, entity: any) => {
    if (!acc[entity.parent]) acc[entity.parent] = [];
    acc[entity.parent].push(entity);
    return acc;
  }, {});

  const renderTreeItem = (id: string, label: string, icon: React.ReactNode) => {
    const isSelected = selectedEntityId === id;
    return (
      <div 
        key={id}
        onClick={() => setSelectedEntity(id)}
        className={`atlas-tree-item ${isSelected ? 'selected' : ''}`}
      >
        {icon}
        <span className="atlas-tree-item-label">{label}</span>
      </div>
    );
  };

  const renderFolder = (title: string, icon: React.ReactNode, children: React.ReactNode) => {
    const isExpanded = expanded[title] !== false; // Default expanded
    return (
      <div className="atlas-tree-folder" key={title}>
        <div 
          onClick={() => toggle(title)}
          className="atlas-tree-folder-header"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {icon}
          <span className="atlas-tree-folder-header-title">{title}</span>
        </div>
        {isExpanded && <div className="atlas-tree-folder-children">{children}</div>}
      </div>
    );
  };

  if (entities.length === 0) {
    return <div className="atlas-tree-container" style={{ padding: '20px', color: 'var(--text-tertiary)' }}>No hay modelo estructural generado.</div>;
  }

  return (
    <div className="atlas-tree-container">
      <div className="atlas-tree-content">
        {renderFolder('Estructura Principal', <Columns size={14} />, (
          <>
            {Object.keys(porticos).map(porticoName => 
              renderFolder(porticoName, <Box size={14} color="var(--color-accent-default)" />, (
                porticos[porticoName].map((entity: any) => 
                  renderTreeItem(entity.id, entity.name, <Layers size={14} color="var(--text-secondary)" />)
                )
              ))
            )}
          </>
        ))}
      </div>
    </div>
  );
}
