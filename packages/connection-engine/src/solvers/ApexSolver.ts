import { IConnectionSolver } from './IConnectionSolver';
import { INodeTopology, IConnectionDetail, ISteelPlate, ICopingInstruction } from '../domain/ConnectionDTOs';
import { BoltPatternSolver } from './BoltPatternSolver';

export class ApexSolver implements IConnectionSolver {
  canResolve(topology: INodeTopology): boolean {
    // Es un ápice si no es soporte y une dos vigas de cubierta (rafters)
    const isApex = !topology.isSupportNode && topology.members.filter(m => m.role === 'beam').length === 2;
    return isApex;
  }

  resolve(topology: INodeTopology): IConnectionDetail {
    const beam1 = topology.members[0];
    // La conexión de cumbrera clásica utiliza una "End Plate" (Chapa frontal) a tope en cada viga.
    // Asumiremos que el motor 3D une los extremos, pero aquí generamos la chapa y despuntes.

    const plateWidth = beam1.profile.width + 20; // 10mm de margen lateral
    const plateHeight = beam1.profile.height + 150; // Sobresale hacia abajo para más tornillos de momento
    
    const platePolygon = [
      { x: -plateWidth/2, y: -plateHeight/2 },
      { x: plateWidth/2, y: -plateHeight/2 },
      { x: plateWidth/2, y: plateHeight/2 },
      { x: -plateWidth/2, y: plateHeight/2 }
    ];

    const endPlate: ISteelPlate = {
      id: 'plate_apex_' + topology.nodeId,
      thickness: 16, // 5/8"
      polygon2d: platePolygon,
      transform: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]) 
    };

    // Patrón de tornillos: extendido hacia la zona de tracción (abajo/arriba según momento)
    // Para Apex, el momento es máximo, usaremos un patrón al tresbolillo
    const boltGroup = BoltPatternSolver.generateStaggeredPattern(
      plateWidth, 
      plateHeight, 
      40, // edge distance
      4   // 4 pares de pernos
    );

    // Instrucción de recorte (Coping)
    // En un Apex estándar las vigas chocan a un ángulo. Físicamente se cortan a bisel (flush cut).
    // Instruimos al ProfileGenerator cortar el extremo a plomo.
    const flushCut1: ICopingInstruction = {
      targetMemberId: beam1.id,
      cutPlanePosition: 0,
      depth: 0, // Corte transversal completo (a inglete)
      copeType: 'flush' 
    };

    const flushCut2: ICopingInstruction = {
      targetMemberId: topology.members[1].id,
      cutPlanePosition: 0,
      depth: 0,
      copeType: 'flush' 
    };

    return {
      nodeId: topology.nodeId,
      type: 'Apex',
      plates: [endPlate, { ...endPlate, id: endPlate.id + '_mirror' }], // Una por cada viga
      boltGroups: [boltGroup],
      copes: [flushCut1, flushCut2]
    };
  }
}
