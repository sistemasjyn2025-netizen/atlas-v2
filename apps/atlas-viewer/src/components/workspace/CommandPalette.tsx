import React, { useState, useEffect } from 'react';
import { useSelectionContext } from '../../contexts/SelectionContext';
import './CommandPalette.css';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { setSelectedEntityId } = useSelectionContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  const commands = [
    { label: 'Abrir Proyecto', action: () => console.log('Open Project') },
    { label: 'Guardar Proyecto', action: () => console.log('Save Project') },
    { label: 'Exportar Lista de Materiales (BOM)', action: () => console.log('Export BOM') },
    { label: 'Exportar a PDF', action: () => console.log('Export PDF') },
    { label: 'Buscar Entidades', action: () => console.log('Search Entities') },
    { label: 'Activar Modo Demo (Ctrl+Shift+D)', action: () => {
      const event = new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'D' });
      window.dispatchEvent(event);
    }}
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="command-palette-overlay" onClick={() => setOpen(false)}>
      <div className="command-palette-modal" onClick={e => e.stopPropagation()}>
        <input 
          autoFocus
          className="command-palette-input"
          placeholder="> Escriba un comando..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="command-palette-list">
          {filteredCommands.map(cmd => (
            <div 
              key={cmd.label} 
              className="command-palette-item"
              onClick={() => {
                cmd.action();
                setOpen(false);
              }}
            >
              {cmd.label}
            </div>
          ))}
          {filteredCommands.length === 0 && (
            <div className="command-palette-item" style={{ cursor: 'default' }}>
              No se encontraron comandos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
