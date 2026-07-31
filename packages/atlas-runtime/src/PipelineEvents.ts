export type PipelineStage = 
  | 'Initialization'
  | 'Parametric Generation'
  | 'Spatial & Assembly'
  | 'Connections'
  | 'Manufacturing & BOM'
  | 'Cost Estimation'
  | 'Documentation'
  | 'Finalizing';

export interface PipelineProgressEvent {
  stage: PipelineStage;
  progress: number; // 0 to 1
  message: string;
}

export interface PipelineEvents {
  'pipeline:start': void;
  'pipeline:progress': PipelineProgressEvent;
  'pipeline:complete': void;
  'pipeline:error': { error: Error; stage: PipelineStage };
}

export type PipelineEventListener<K extends keyof PipelineEvents> = (event: PipelineEvents[K]) => void;

export class PipelineEventEmitter {
  private listeners: { [K in keyof PipelineEvents]?: PipelineEventListener<K>[] } = {};

  public on<K extends keyof PipelineEvents>(event: K, listener: PipelineEventListener<K>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  public off<K extends keyof PipelineEvents>(event: K, listener: PipelineEventListener<K>) {
    if (!this.listeners[event]) return;
    this.listeners[event] = (this.listeners[event] as any).filter((l: any) => l !== listener);
  }

  public emit<K extends keyof PipelineEvents>(event: K, payload: PipelineEvents[K]) {
    if (!this.listeners[event]) return;
    this.listeners[event]!.forEach(listener => listener(payload));
  }
}
