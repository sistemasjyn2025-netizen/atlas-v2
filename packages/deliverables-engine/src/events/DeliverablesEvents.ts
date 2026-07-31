import { DeliverableFile } from '../domain/DeliverableFile';

export type DeliverableEvent = 
  | { type: 'PublishStarted'; projectId: string; totalExporters: number }
  | { type: 'ExporterStarted'; exporterName: string }
  | { type: 'ExporterCompleted'; exporterName: string; files: DeliverableFile[] }
  | { type: 'ExporterFailed'; exporterName: string; error: string }
  | { type: 'PublishCompleted'; projectId: string; totalFiles: number };

type EventListener = (event: DeliverableEvent) => void;

export class DeliverablesEventEmitter {
  private listeners: EventListener[] = [];

  public on(listener: EventListener): void {
    this.listeners.push(listener);
  }

  public off(listener: EventListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public emit(event: DeliverableEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
