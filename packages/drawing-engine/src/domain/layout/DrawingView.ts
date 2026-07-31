import { DrawingEntity } from '../entities/DrawingEntity';

export interface ViewVersionMetadata {
  versionId: string;
  checksum: string;
  generatedFromPipeline: string;
  generatedAt: string;
  generatorVersion: string;
}

export class DrawingView {
  private entities: DrawingEntity[] = [];

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly versionMetadata: ViewVersionMetadata
  ) {}

  public addEntity(entity: DrawingEntity): void {
    this.entities.push(entity);
  }

  public getEntities(): ReadonlyArray<DrawingEntity> {
    return this.entities;
  }
}
