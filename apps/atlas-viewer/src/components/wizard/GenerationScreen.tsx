import React, { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { AtlasPipeline } from '@atlas/runtime';
import type { PipelineStage } from '@atlas/runtime';

const steps: PipelineStage[] = [
  'Initialization',
  'Parametric Generation',
  'Connections',
  'Manufacturing & BOM',
  'Cost Estimation',
  'Documentation',
  'Finalizing'
];

export const GenerationScreen: React.FC<{ data: any, onComplete: (result: any) => void }> = ({ data, onComplete }) => {
  const [currentStage, setCurrentStage] = useState<PipelineStage | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Preparing...");
  const pipelineStarted = useRef(false);

  useEffect(() => {
    if (pipelineStarted.current) return;
    pipelineStarted.current = true;

    const pipeline = new AtlasPipeline();

    pipeline.on('pipeline:progress', (event) => {
      setCurrentStage(event.stage);
      setProgress(event.progress);
      setMessage(event.message);
    });

    pipeline.on('pipeline:complete', () => {
      // Small delay just to let user see "100%" before switching
      setTimeout(() => {
         // Proceed to next step
      }, 500);
    });

    const run = async () => {
      try {
        // Build project file format expected by the pipeline
        const projectFile = {
          version: '1.0',
          metadata: { id: 'custom', name: data.projectName },
          building: {
            width: data.width,
            length: data.length,
            height: data.height,
            baySpacing: data.baySpacing,
            roofType: 'gable' as const,
            roofSlope: data.roofSlope,
            structuralProfile: data.mainProfileId,
            frontGates: 2,
            rearGates: 2,
            sideGates: 1
          }
        };

        const result = await pipeline.execute(projectFile as any);
        if (!result.success) {
           console.error("Pipeline failed:", result.errors);
           setMessage("Error: " + (result.errors || []).join(', '));
           return;
        }

        setTimeout(() => {
          onComplete({ wizardData: data, pipelineResult: result });
        }, 500);
      } catch (err) {
        console.error(err);
      }
    };

    run();
  }, [data, onComplete]);

  const currentStepIndex = currentStage ? steps.indexOf(currentStage) : -1;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#010409',
      color: '#c9d1d9',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      
      {/* Faded Isom Grid Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
        opacity: 0.5,
        zIndex: 0
      }} />

      <div style={{ zIndex: 10, width: 450, background: 'rgba(13,17,23,0.8)', padding: 32, borderRadius: 12, border: '1px solid #30363d', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <Loader2 size={32} color="#58a6ff" className="spin-anim" />
        </div>
        
        <h2 style={{ textAlign: 'center', fontSize: 18, margin: '0 0 12px 0', color: '#fff' }}>
          {progress >= 100 ? "Opening Workspace..." : "Generating Project..."}
        </h2>
        
        <p style={{ textAlign: 'center', fontSize: 13, color: '#8b949e', marginBottom: 24, minHeight: 20 }}>
          {message}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || progress >= 100;
            const isCurrent = idx === currentStepIndex && progress < 100;
            
            let barWidth = '0%';
            if (isCompleted) barWidth = '100%';
            if (isCurrent) barWidth = `100%`; // In actual logic it fills instantly per stage in our rough event mapping, but we could smooth it out. For now 100% for completed stages. Wait, if it's current, we could just show it pulsing or loading.
            
            // To make it look nice, if current, we can animate it
            return (
              <div key={idx} style={{ opacity: isCompleted || isCurrent ? 1 : 0.4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: isCurrent ? '#58a6ff' : (isCompleted ? '#8b949e' : '#8b949e') }}>{step}</span>
                  {isCompleted && <span style={{ color: '#3fb950' }}>Done</span>}
                  {isCurrent && <span style={{ color: '#58a6ff' }}>Working...</span>}
                </div>
                <div style={{ width: '100%', height: 4, background: '#21262d', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: barWidth, height: '100%', background: isCompleted ? '#3fb950' : '#58a6ff', transition: 'width 0.3s ease-out' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
