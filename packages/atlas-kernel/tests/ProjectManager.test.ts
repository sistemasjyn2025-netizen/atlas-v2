import { ProjectManager } from '../src/ProjectManager';
import { EntityManager } from '../src/EntityManager';

describe('ProjectManager', () => {
  it('should create a new project and serialize it correctly', () => {
    const manager = new ProjectManager();
    const { document, entityManager } = manager.createNewProject('Test Project');
    
    expect(document.metadata.formatVersion).toBe('0.1');
    expect(document.metadata.atlasVersion).toBe('0.1');
    
    const projects = entityManager.getGraph().projects;
    const projectValues = Object.values(projects);
    expect(projectValues.length).toBe(1);
    expect(projectValues[0].name).toBe('Test Project');

    const serialized = manager.serialize(document);
    expect(typeof serialized).toBe('string');
    
    const { document: deserializedDoc } = manager.deserialize(serialized);
    expect(deserializedDoc.metadata.formatVersion).toBe('0.1');
    expect(deserializedDoc.graph.projects[projectValues[0].id].name).toBe('Test Project');
  });
});
