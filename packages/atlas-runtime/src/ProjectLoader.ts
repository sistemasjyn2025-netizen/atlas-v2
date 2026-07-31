import * as fs from 'fs';
import { AtlasProjectFile } from './types';

export class ProjectLoader {
  public static loadFromFile(filePath: string): AtlasProjectFile {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const project = JSON.parse(content) as any;
    
    this.validate(project);
    
    return project as AtlasProjectFile;
  }

  public static validate(project: any): void {
    if (project.version !== '1.0') {
      throw new Error('Unsupported project version. Expected "1.0".');
    }
    if (!project.building) {
      throw new Error('Missing "building" definition in project file.');
    }
    const b = project.building;
    if (!b.width || !b.length || !b.height || !b.baySpacing || !b.structuralProfile) {
      throw new Error('Incomplete building parameters. Required: width, length, height, baySpacing, structuralProfile.');
    }
  }
}
