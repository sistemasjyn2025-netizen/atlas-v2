import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import './ParametricPanel.css';

export const ParametricPanel: React.FC = () => {
  const { projectInput, setProjectInput } = useProjectStore();
  
  if (!projectInput) return null;

  const handleChange = (field: string, value: any) => {
    setProjectInput({ [field]: value });
  };

  const renderSliderInput = (label: string, field: string, min: number, max: number, step: number) => {
    const value = projectInput[field] || 0;
    return (
      <div className="parametric-group">
        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
          <span>{label}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{value}</span>
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

  const renderSelectInput = (label: string, field: string, options: { label: string, value: string }[]) => {
    const value = projectInput[field];
    return (
      <div className="parametric-group">
        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
          <span>{label}</span>
        </label>
        <select
          className="atlas-input"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          style={{ width: '100%', padding: '8px', background: 'var(--surface-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}
        >
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    );
  };

  return (
    <div className="atlas-panel parametric-panel" style={{ padding: '16px', overflowY: 'auto', height: '100%' }}>
      <div className="parametric-header">
        <h3 className="atlas-panel-title">Parámetros</h3>
      </div>
      <div className="parametric-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {renderSelectInput('Tipo de Estructura', 'structureType', [
          { label: 'Alma Llena', value: 'alma-llena' },
          { label: 'Reticulado (Celosía)', value: 'reticulado' }
        ])}
        {renderSelectInput('Tipo de Techo', 'roofType', [
          { label: 'A Dos Aguas', value: 'dos-aguas' },
          { label: 'A Un Agua', value: 'un-agua' }
        ])}
        {renderSliderInput('Ancho (Luz Libre) (mm)', 'width', 5000, 50000, 1000)}
        {renderSliderInput('Largo (mm)', 'length', 10000, 100000, 1000)}
        {renderSliderInput('Altura de Columna (mm)', 'height', 3000, 15000, 500)}
        {renderSliderInput('Pendiente del Techo (%)', 'roofPitch', 5, 40, 1)}
        {renderSliderInput('Separación entre Pórticos (mm)', 'frameSpacing', 3000, 10000, 500)}
        {renderSliderInput('Separación de Correas (mm)', 'purlinSpacing', 500, 2000, 100)}

        <div className="parametric-header" style={{ marginTop: '10px', padding: 0 }}>
          <h3 className="atlas-panel-title">Presupuesto</h3>
        </div>
        {renderSliderInput('Costo del Acero (USD/kg)', 'pricePerKg', 0, 20, 0.1)}
      </div>
    </div>
  );
};
