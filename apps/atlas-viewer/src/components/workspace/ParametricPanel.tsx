import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import './ParametricPanel.css';

export const ParametricPanel: React.FC = () => {
  const { projectInput, setProjectInput } = useProjectStore();
  
  if (!projectInput) return null;

  const handleChange = (field: string, value: number) => {
    setProjectInput({ [field]: value });
  };

  const renderSliderInput = (label: string, field: string, min: number, max: number, step: number) => {
    const value = projectInput[field] || 0;
    return (
      <div className="parametric-group">
        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
          <span>{label}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{value} mm</span>
        </label>
        <div className="parametric-input-row" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            type="range" 
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => handleChange(field, Number(e.target.value))}
            style={{ flex: 1, cursor: 'pointer' }}
          />
          <input 
            type="number" 
            className="atlas-input" 
            value={value}
            onChange={(e) => handleChange(field, Number(e.target.value))}
            style={{ width: '80px' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="atlas-panel parametric-panel">
      <div className="parametric-header">
        <h3 className="atlas-panel-title">Parámetros</h3>
      </div>
      <div className="parametric-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {renderSliderInput('Ancho (mm)', 'width', 5000, 50000, 1000)}
        {renderSliderInput('Largo (mm)', 'length', 10000, 100000, 1000)}
        {renderSliderInput('Altura de Columna (mm)', 'height', 3000, 15000, 500)}
        {renderSliderInput('Distancia entre Pórticos (mm)', 'baySpacing', 3000, 8000, 500)}
      </div>
    </div>
  );
};
