import { createContext, useContext } from 'react';
import type { PipelineResult } from '@atlas/runtime';

export type PipelineStatus = 'Idle' | 'Queued' | 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';

export interface PipelineState {
  pipelineResult: PipelineResult | null;
  status: PipelineStatus;
  isCalculating: boolean;
  currentStage: string;
  progress: number;
  elapsedTime: number;
  warnings: string[];
  errors: string[];
}

export const PipelineContext = createContext<PipelineState>({
  pipelineResult: null,
  status: 'Idle',
  isCalculating: false,
  currentStage: '',
  progress: 0,
  elapsedTime: 0,
  warnings: [],
  errors: []
});

export const usePipelineContext = () => useContext(PipelineContext);
