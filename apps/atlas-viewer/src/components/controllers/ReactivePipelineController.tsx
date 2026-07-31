import React, { useState, useEffect, useRef } from 'react';
import { PipelineContext } from '../../contexts/PipelineContext';
import type { PipelineStatus, PipelineState } from '../../contexts/PipelineContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { AtlasPipeline } from '@atlas/runtime';
import type { PipelineResult } from '@atlas/runtime';
import { GeometryValidator } from '../../services/GeometryValidator';

interface Props {
  children: React.ReactNode;
  onPipelineComplete?: (result: PipelineResult) => void;
}

export const ReactivePipelineController: React.FC<Props> = ({ children, onPipelineComplete }) => {
  const { projectInput, updateProjectInput } = useProjectContext();
  
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [status, setStatus] = useState<PipelineStatus>('Idle');
  const [currentStage, setCurrentStage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!projectInput) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setStatus('Queued');

    debounceTimerRef.current = setTimeout(() => {
      const sanitizedInput = GeometryValidator.sanitize(projectInput);
      
      // Auto-corregir (Snap-back) en la UI si el motor matemático detectó valores prohibidos
      if (JSON.stringify(sanitizedInput) !== JSON.stringify(projectInput)) {
        updateProjectInput(sanitizedInput);
        return; // El re-render disparará este useEffect con el input ya validado
      }

      executePipeline(sanitizedInput);
    }, 400); // 400ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [projectInput]);

  const executePipeline = async (input: any) => {
    // Cancel previous execution if running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setStatus('Running');
    setProgress(0);
    setCurrentStage('Starting...');
    setErrors([]);
    setWarnings([]);
    startTimeRef.current = performance.now();
    
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor(performance.now() - startTimeRef.current));
    }, 100);

    const pipeline = new AtlasPipeline();

    const onProgress = (payload: any) => {
      setCurrentStage(payload.message || payload.stage);
      setProgress(payload.progress);
    };

    const onError = (payload: any) => {
      setErrors(prev => [...prev, payload.error?.message || 'Unknown error']);
    };

    pipeline.on('pipeline:progress', onProgress);
    pipeline.on('pipeline:error', onError);

    try {
      const projectFile = {
        version: '1.0',
        metadata: { name: 'Parametric Project' },
        building: input // The input directly maps to building spec
      };

      const result = await pipeline.execute(projectFile as any, abortController.signal);

      if (!abortController.signal.aborted) {
        setStatus(result.success ? 'Succeeded' : 'Failed');
        setPipelineResult(result);
        if (result.success && onPipelineComplete) {
          onPipelineComplete(result);
        }
      }
    } catch (err: any) {
      if (err.message === 'Pipeline Execution Cancelled') {
        setStatus('Cancelled');
      } else {
        setStatus('Failed');
        setErrors(prev => [...prev, err.message]);
      }
    } finally {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      pipeline.off('pipeline:progress', onProgress);
      pipeline.off('pipeline:error', onError);
    }
  };

  const state: PipelineState = {
    pipelineResult,
    status,
    isCalculating: status === 'Queued' || status === 'Running',
    currentStage,
    progress,
    elapsedTime,
    warnings,
    errors
  };

  return (
    <PipelineContext.Provider value={state}>
      {children}
    </PipelineContext.Provider>
  );
};
