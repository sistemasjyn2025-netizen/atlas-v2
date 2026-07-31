import { DrawingEntity } from '../entities/DrawingEntity';

export class DrawingEntityCollection {
  private entities: DrawingEntity[] = [];

  public add(entity: DrawingEntity): void {
    this.entities.push(entity);
  }

  public addAll(entities: DrawingEntity[]): void {
    this.entities.push(...entities);
  }

  public getEntities(): ReadonlyArray<DrawingEntity> {
    return this.entities;
  }

  public get count(): number {
    return this.entities.length;
  }
}
