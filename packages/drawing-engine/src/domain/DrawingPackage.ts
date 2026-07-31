import { DrawingSheet } from './layout/DrawingSheet';

export class DrawingPackage {
  private sheets: DrawingSheet[] = [];

  constructor(
    public readonly name: string,
    public readonly description: string
  ) {}

  public addSheet(sheet: DrawingSheet): void {
    this.sheets.push(sheet);
  }

  public getSheets(): ReadonlyArray<DrawingSheet> {
    return this.sheets;
  }
}
