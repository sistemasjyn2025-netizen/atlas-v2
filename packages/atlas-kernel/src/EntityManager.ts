import { v4 as uuidv4 } from 'uuid';
import { 
  EntityGraph, 
  Project, 
  StructuralSystem, 
  Assembly, 
  Component, 
  Element, 
  Geometry 
} from '@atlas/types';

export class EntityManager {
  private graph: EntityGraph;

  constructor(initialGraph?: EntityGraph) {
    this.graph = initialGraph || {
      projects: {},
      structuralSystems: {},
      assemblies: {},
      subAssemblies: {},
      components: {},
      elements: {},
      geometries: {},
      connections: {},
      joints: {},
      specifications: {},
      documents: {},
      sheets: {},
      views: {},
      dimensions: {},
      annotations: {}
    };
  }

  public getGraph(): EntityGraph {
    return this.graph;
  }

  public createProject(name: string): Project {
    const project: Project = {
      id: uuidv4(),
      type: 'Project',
      name,
      version: 1,
      structuralSystemIds: []
    };
    this.graph.projects[project.id] = project;
    return project;
  }

  // Other creation methods would follow similar patterns
}
