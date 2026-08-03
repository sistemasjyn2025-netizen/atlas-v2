import React, { useState } from 'react';
import { WizardBackground } from './WizardBackground';
import { useCatalog } from './CatalogContext';
import { CatalogCategory } from '@atlas/catalog-engine';
import { GenerationScreen } from './GenerationScreen';

interface WizardData {
  projectName: string;
  clientName: string;
  location: string;
  buildingCode: string;
  width: number;
  length: number;
  height: number;
  frameSpacing: number;
  roofPitch: number;
  purlinSpacing: number;
  roofType: string;
  structureType: string;
  mainProfileId: string;
  materialId: string;
}

const profileOptions = [
  { value: 'ipe', label: 'Perfil IPE/W (Alma Llena)' },
  { value: 'c-profile', label: 'Perfil C / UPN' },
  { value: 'hss', label: 'Tubo Estructural Rectangular' },
  { value: 'truss', label: 'Reticulado (Celosía)' }
];

const materialOptions = [
  { value: 'a36', label: 'Acero Estándar (ASTM A36 / F-24)' },
  { value: 'a572', label: 'Acero Alta Resistencia (A572 Gr. 50)' },
  { value: 'galvanized', label: 'Acero Galvanizado' }
];

export const ProjectWizard: React.FC<{ onComplete: (data: any) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const { engine, loading } = useCatalog();
  const [data, setData] = useState<WizardData>({
    projectName: 'Industrial Warehouse',
    clientName: 'Acme Corp',
    location: 'Buenos Aires',
    buildingCode: 'CIRSOC 301',
    width: 50000,
    length: 70000,
    height: 8000,
    frameSpacing: 6000,
    roofPitch: 15,
    purlinSpacing: 1000,
    roofType: 'dos-aguas',
    structureType: 'alma-llena',
    mainProfileId: 'ipe',
    materialId: 'a36'
  });

  if (loading) {
    return <div style={{ color: 'white', padding: 40, fontFamily: 'Inter, sans-serif' }}>Initializing ATLAS Platform...</div>;
  }

  const updateData = (partial: Partial<WizardData>) => setData(prev => ({ ...prev, ...partial }));

  return (
    <div style={{
      width: '100vw', height: '100vh',
      position: 'relative',
      background: '#010409',
      color: '#c9d1d9',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <WizardBackground />
      
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 80px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, color: '#ffffff' }}>ATLAS</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#8b949e' }}>Industrial Engineering Platform</p>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            background: 'rgba(22, 27, 34, 0.6)', 
            border: '1px solid #30363d', 
            borderRadius: 8, 
            padding: 40, 
            width: 600,
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            {step === 1 && (
              <Step1 data={data} update={updateData} next={() => setStep(2)} />
            )}
            {step === 2 && (
              <Step2 data={data} update={updateData} back={() => setStep(1)} next={() => setStep(3)} />
            )}
            {step === 3 && (
              <Step3 data={data} update={updateData} back={() => setStep(2)} next={() => setStep(4)} />
            )}
            {step === 4 && (
              <Step4 data={data} back={() => setStep(3)} generate={() => setStep(5)} />
            )}
            {step === 5 && (
              <GenerationScreen data={data} onComplete={onComplete} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: 20, right: 40,
          fontSize: 12, color: '#484f58', fontFamily: 'monospace'
        }}>
          ATLAS Platform | Rule Pack: ATLAS Standard | Catalog: Standard Catalog | Pipeline: v1.0 | Workspace: Ready
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const InputStyle = {
  width: '100%', padding: '10px 14px', background: '#0d1117', border: '1px solid #30363d', 
  color: '#c9d1d9', borderRadius: 6, marginBottom: 16, outline: 'none',
  fontFamily: 'Inter, sans-serif'
};
const ButtonStyle = {
  padding: '10px 24px', background: '#238636', color: '#fff', border: 'none',
  borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif'
};
const GhostButtonStyle = { ...ButtonStyle, background: 'transparent', color: '#8b949e', border: '1px solid #30363d' };

const Step1 = ({ data, update, next }: any) => (
  <div>
    <h2 style={{ color: '#fff', marginTop: 0 }}>1. Información del Proyecto</h2>
    <label>Nombre del Proyecto</label>
    <input style={InputStyle} value={data.projectName} onChange={e => update({ projectName: e.target.value })} />
    <label>Cliente</label>
    <input style={InputStyle} value={data.clientName} onChange={e => update({ clientName: e.target.value })} />
    <label>Ubicación</label>
    <input style={InputStyle} value={data.location} onChange={e => update({ location: e.target.value })} />
    <label>Normativa</label>
    <input style={InputStyle} value={data.buildingCode} onChange={e => update({ buildingCode: e.target.value })} />
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
      <button style={ButtonStyle} onClick={next}>Siguiente</button>
    </div>
  </div>
);

const Step2 = ({ data, update, back, next }: any) => (
  <div>
    <h2 style={{ color: '#fff', marginTop: 0 }}>2. Geometría</h2>
    
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <label>Tipo de Estructura</label>
        <select style={InputStyle} value={data.structureType} onChange={e => update({ structureType: e.target.value })}>
          <option value="alma-llena">Alma Llena</option>
          <option value="reticulado">Reticulado (Celosía)</option>
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <label>Tipo de Techo</label>
        <select style={InputStyle} value={data.roofType} onChange={e => update({ roofType: e.target.value })}>
          <option value="dos-aguas">A Dos Aguas</option>
          <option value="un-agua">A Un Agua</option>
        </select>
      </div>
    </div>

    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <label>Ancho (Luz Libre) (mm)</label>
        <input type="number" style={InputStyle} value={data.width} onChange={e => update({ width: Number(e.target.value) })} />
      </div>
      <div style={{ flex: 1 }}>
        <label>Largo (mm)</label>
        <input type="number" style={InputStyle} value={data.length} onChange={e => update({ length: Number(e.target.value) })} />
      </div>
    </div>
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <label>Altura (mm)</label>
        <input type="number" style={InputStyle} value={data.height} onChange={e => update({ height: Number(e.target.value) })} />
      </div>
      <div style={{ flex: 1 }}>
        <label>Separación de Pórticos (mm)</label>
        <input type="number" style={InputStyle} value={data.frameSpacing} onChange={e => update({ frameSpacing: Number(e.target.value) })} />
      </div>
    </div>
    
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <label>Pendiente de Cubierta (%)</label>
        <input type="number" style={InputStyle} value={data.roofPitch} onChange={e => update({ roofPitch: Number(e.target.value) })} />
      </div>
      <div style={{ flex: 1 }}>
        <label>Separación de Correas (mm)</label>
        <input type="number" style={InputStyle} value={data.purlinSpacing} onChange={e => update({ purlinSpacing: Number(e.target.value) })} />
      </div>
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
      <button style={GhostButtonStyle} onClick={back}>Atrás</button>
      <button style={ButtonStyle} onClick={next}>Siguiente</button>
    </div>
  </div>
);

const Step3 = ({ data, update, back, next }: any) => (
  <div>
    <h2 style={{ color: '#fff', marginTop: 0 }}>3. Ingeniería</h2>
    <label>Perfil Principal</label>
    <select style={InputStyle} value={data.mainProfileId} onChange={e => update({ mainProfileId: e.target.value })}>
      {profileOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
    </select>
    
    <label>Material</label>
    <select style={InputStyle} value={data.materialId} onChange={e => update({ materialId: e.target.value })}>
      {materialOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
    </select>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
      <button style={GhostButtonStyle} onClick={back}>Atrás</button>
      <button style={ButtonStyle} onClick={next}>Revisar</button>
    </div>
  </div>
);

const Step4 = ({ data, back, generate }: any) => {
  const profileLabel = profileOptions.find(p => p.value === data.mainProfileId)?.label || data.mainProfileId;
  const materialLabel = materialOptions.find(m => m.value === data.materialId)?.label || data.materialId;

  return (
    <div>
      <h2 style={{ color: '#fff', marginTop: 0 }}>4. Resumen</h2>
      <div style={{ background: '#0d1117', padding: 20, borderRadius: 6, border: '1px solid #30363d', marginBottom: 24 }}>
        <p style={{ margin: '0 0 8px 0' }}><strong>Proyecto:</strong> {data.projectName} ({data.clientName})</p>
        <p style={{ margin: '0 0 8px 0' }}><strong>Geometría:</strong> {data.width}x{data.length} mm, H={data.height} mm</p>
        <p style={{ margin: '0 0 8px 0' }}><strong>Estructura:</strong> {data.structureType === 'reticulado' ? 'Reticulado' : 'Alma Llena'} | {data.roofType === 'un-agua' ? 'Un Agua' : 'Dos Aguas'}</p>
        <p style={{ margin: '0 0 8px 0' }}><strong>Material:</strong> {profileLabel} en {materialLabel}</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button style={GhostButtonStyle} onClick={back}>Atrás</button>
        <button style={{ ...ButtonStyle, background: '#1f6feb' }} onClick={generate}>GENERAR</button>
      </div>
    </div>
  );
};
