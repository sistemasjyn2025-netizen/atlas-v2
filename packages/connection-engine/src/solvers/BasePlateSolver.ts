import { IConnectionSolver } from './IConnectionSolver';
import { INodeTopology, IConnectionDetail, ISteelPlate } from '../domain/ConnectionDTOs';
import { BoltPatternSolver } from './BoltPatternSolver';

export class BasePlateSolver implements IConnectionSolver {
  canResolve(topology: INodeTopology): boolean {
    return topology.isSupportNode && topology.members.some(m => m.role === 'column');
  }

  resolve(topology: INodeTopology): IConnectionDetail {
    const column = topology.members.find(m => m.role === 'column')!;
    
    // Parámetros de ingeniería: La placa base sobresale 50mm por cada lado
    const overhang = 50;
    const plateWidth = column.profile.width + (overhang * 2);
    const plateHeight = column.profile.height + (overhang * 2);
    
    // Generar el contorno 2D en coordenadas locales (Z=0) para exportación a DXF CNC
    const platePolygon = [
      { x: -plateWidth/2, y: -plateHeight/2 },
      { x: plateWidth/2, y: -plateHeight/2 },
      { x: plateWidth/2, y: plateHeight/2 },
      { x: -plateWidth/2, y: plateHeight/2 }
    ];

    const basePlate: ISteelPlate = {
      id: 'plate_base_' + topology.nodeId,
      thickness: 19, // 3/4"
      polygon2d: platePolygon,
      transform: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]) // Identidad provisoria
    };

    // Patrón de pernos de anclaje
    // Los agujeros se insertan a 40mm del borde de la placa
    const edgeDist = 40;
    const boltGroup = BoltPatternSolver.generateRectangularPattern(
      plateWidth, 
      plateHeight, 
      edgeDist, 
      2, // 2 filas
      2  // 2 columnas (4 pernos totales)
    );

    return {
      nodeId: topology.nodeId,
      type: 'BasePlate',
      plates: [basePlate],
      boltGroups: [boltGroup],
      copes: [] // Placa base no requiere recortar (coping) la columna usualmente, va soldada a tope
    };
  }
}
