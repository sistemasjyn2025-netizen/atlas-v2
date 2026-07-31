import { AssemblyBuilder } from '../src/AssemblyBuilder';
import { EntityManager } from '@atlas/kernel';

describe('AssemblyBuilder', () => {
  it('should create an assembly and a subassembly correctly', () => {
    const entityManager = new EntityManager();
    const builder = new AssemblyBuilder(entityManager);
    
    const assembly = builder.createAssembly();
    expect(assembly).toBeDefined();
    
    const sub = builder.createSubAssembly(assembly.id);
    expect(sub).toBeDefined();
    expect(assembly.subAssemblyIds).toContain(sub.id);
  });
});
