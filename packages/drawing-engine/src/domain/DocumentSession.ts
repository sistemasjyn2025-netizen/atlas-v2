import { DrawingPackage } from './DrawingPackage';

export class DocumentSession {
  private packages: Map<string, DrawingPackage> = new Map();
  
  constructor(
    public readonly projectId: string,
    public readonly sessionMetadata: Record<string, any> = {}
  ) {}

  public addPackage(name: string, pkg: DrawingPackage): void {
    this.packages.set(name, pkg);
  }

  public getPackage(name: string): DrawingPackage | undefined {
    return this.packages.get(name);
  }

  public getAllPackages(): DrawingPackage[] {
    return Array.from(this.packages.values());
  }
}
