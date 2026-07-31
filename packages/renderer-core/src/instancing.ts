export type GeometryKey = string;
export type MaterialKey = string;

export interface InstanceTransform {
  renderId: string;
  sourceEntityId: string;
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  scale?: { x: number, y: number, z: number };
}

export interface InstanceBatch {
  batchId: string;
  geometryKey: GeometryKey;
  materialKey: MaterialKey;
  instances: InstanceTransform[];
}

export class InstanceManager {
  private batches: Map<string, InstanceBatch> = new Map();

  public addInstance(
    geometryKey: GeometryKey, 
    materialKey: MaterialKey, 
    transform: InstanceTransform
  ) {
     const batchId = `${geometryKey}_${materialKey}`;
     if (!this.batches.has(batchId)) {
        this.batches.set(batchId, {
           batchId, geometryKey, materialKey, instances: []
        });
     }
     this.batches.get(batchId)!.instances.push(transform);
  }

  public getBatches(): InstanceBatch[] {
    return Array.from(this.batches.values());
  }
}
