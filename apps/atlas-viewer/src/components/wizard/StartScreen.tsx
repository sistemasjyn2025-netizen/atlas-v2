import React, { useState, useEffect } from 'react';
import { ProjectWizard } from './ProjectWizard';
import { WizardBackground } from './WizardBackground';
import { CatalogProvider } from './CatalogContext';
import { Clock, MapPin, Target, FolderOpen } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react';

interface RecentProject {
  id: string;
  name: string;
  location: string;
  date: string;
  rulePack: string;
}

export const StartScreen: React.FC<{ onProjectCreated: (data: any) => void }> = ({ onProjectCreated }) => {
  const [mode, setMode] = useState<'menu' | 'wizard'>('menu');
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRecentProjects(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            location: 'Supabase Cloud',
            date: new Date(p.updatedAt).toLocaleDateString(),
            rulePack: 'ATLAS Standard'
          })));
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchProjects();
  }, [getToken]);

  const loadFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.atlas';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target?.result as string);
            if (data && data.pipelineInput) {
              onProjectCreated({ type: 'NEW', payload: data.pipelineInput });
            }
          } catch (err) {
            alert('Invalid .atlas file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (mode === 'wizard') {
    return (
      <CatalogProvider>
        <ProjectWizard onComplete={(data) => {
          onProjectCreated({ type: 'NEW', payload: data });
        }} />
      </CatalogProvider>
    );
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      position: 'relative',
      background: '#010409',
      color: '#c9d1d9',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <WizardBackground />
      
      <div style={{ position: 'absolute', top: 20, right: 40, zIndex: 100 }}>
        <SignedOut>
          <SignInButton mode="modal">
            <button style={{ padding: '8px 16px', background: 'transparent', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Iniciar Sesión
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 100px', width: '100%', maxWidth: 1200, alignItems: 'center' }}>
        
        {/* Logo and Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 80 }}>
          <img src="/logo.png" alt="ATLAS Logo" style={{ width: 48, height: 48, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
          <div>
            <h1 style={{ fontSize: 28, margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>ATLAS</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#8b949e' }}>Industrial Engineering Platform</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 64 }}>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px', fontSize: 16, background: '#1f6feb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 24px rgba(31,111,235,0.4)', transition: 'transform 0.1s' }}
            onClick={() => setMode('wizard')}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Nuevo Proyecto
          </button>
          
          <button 
            onClick={loadFile}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px', fontSize: 16, background: 'rgba(33,38,45,0.8)', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 8, cursor: 'pointer', fontWeight: 600, backdropFilter: 'blur(8px)', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(48,54,61,0.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(33,38,45,0.8)'}
          >
            <FolderOpen size={18} />
            Abrir Proyecto
          </button>
        </div>

        {/* Recent Projects */}
        <div style={{ textAlign: 'left', background: 'rgba(13,17,23,0.7)', backdropFilter: 'blur(12px)', border: '1px solid #30363d', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 14, color: '#8b949e', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Proyectos Recientes</h2>
          
          {recentProjects.length === 0 ? (
            <div style={{ color: '#484f58', fontStyle: 'italic', fontSize: 14 }}>No hay proyectos recientes.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentProjects.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(1,4,9,0.5)', borderRadius: 8, border: '1px solid #21262d', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#8b949e'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#21262d'}
                  onClick={() => onProjectCreated({ type: 'LOAD', projectId: p.id })}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#ffffff', fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#8b949e', fontSize: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {p.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={12} /> {p.rulePack}</span>
                    </div>
                  </div>
                  <div style={{ color: '#8b949e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} /> {p.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 20, right: 40,
        fontSize: 12, color: '#484f58', fontFamily: 'monospace'
      }}>
        ATLAS Platform Alpha | v0.1.0
      </div>
    </div>
  );
};
