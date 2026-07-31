import { v4 as uuidv4 } from 'uuid';
import { EntityManager } from '@atlas/kernel';
import { Assembly, SubAssembly, Component, Element, Connection } from '@atlas/types';
import { Transform } from '@atlas/spatial-engine';

export class AssemblyBuilder {
  constructor(private entityManager: EntityManager) {}

  public createAssembly(transform?: Transform): Assembly {
    const assembly: Assembly = {
      id: uuidv4(),
      type: 'Assembly',
      componentIds: [],
      subAssemblyIds: [],
      connectionIds: [],
      transform
    };
    this.entityManager.getGraph().assemblies[assembly.id] = assembly;
    return assembly;
  }

  public createSubAssembly(parentAssemblyId: string, transform?: Transform): SubAssembly {
    const subAssembly: SubAssembly = {
      id: uuidv4(),
      type: 'SubAssembly',
      componentIds: [],
      transform
    };
    this.entityManager.getGraph().subAssemblies[subAssembly.id] = subAssembly;
    
    const parent = this.entityManager.getGraph().assemblies[parentAssemblyId];
    if (parent) {
      parent.subAssemblyIds.push(subAssembly.id);
    }
    
    return subAssembly;
  }

  public createComponent(parentAssemblyId: string, transform?: Transform, specificationId?: string): Component {
    const component: Component = {
      id: uuidv4(),
      type: 'Component',
      elementIds: [],
      transform,
      specificationId
    };
    this.entityManager.getGraph().components[component.id] = component;
    
    const parent = this.entityManager.getGraph().assemblies[parentAssemblyId];
    if (parent) {
      parent.componentIds.push(component.id);
    }
    
    return component;
  }

  public createElement(parentComponentId: string, transform?: Transform, specificationId?: string): Element {
    const element: Element = {
      id: uuidv4(),
      type: 'Element',
      transform,
      specificationId
    };
    this.entityManager.getGraph().elements[element.id] = element;
    
    const parent = this.entityManager.getGraph().components[parentComponentId];
    if (parent) {
      parent.elementIds.push(element.id);
    }
    
    return element;
  }

  public createSpecification<T extends import('@atlas/types').Specification>(spec: Omit<T, 'id' | 'type'>): T {
    const specification = {
      ...spec,
      id: uuidv4(),
      type: 'Specification'
    } as unknown as T;
    
    this.entityManager.getGraph().specifications[specification.id] = specification;
    return specification;
  }

  public createConnection(parentAssemblyId: string, connectedEntityIds: string[]): Connection {
    const connection: Connection = {
      id: uuidv4(),
      type: 'Connection',
      connectedEntityIds
    };
    this.entityManager.getGraph().connections[connection.id] = connection;

    const parent = this.entityManager.getGraph().assemblies[parentAssemblyId];
    if (parent) {
      parent.connectionIds.push(connection.id);
    }

    return connection;
  }
}
