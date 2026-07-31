import { IDrawingGenerator } from './IDrawingGenerator';

export class PluginRegistry {
  private static generators: Map<string, IDrawingGenerator> = new Map();

  public static register(name: string, generator: IDrawingGenerator): void {
    this.generators.set(name, generator);
  }

  public static get(name: string): IDrawingGenerator | undefined {
    return this.generators.get(name);
  }

  public static getAll(): IDrawingGenerator[] {
    return Array.from(this.generators.values());
  }

  public static clear(): void {
    this.generators.clear();
  }
}
