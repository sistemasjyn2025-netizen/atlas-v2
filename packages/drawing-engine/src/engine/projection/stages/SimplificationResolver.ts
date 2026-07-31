import { IProjectionStage, ProjectionContext } from '../../../domain/projection/IProjectionStage';
import { ProjectedGeometry } from '../../../domain/projection/ProjectedGeometry';

export class SimplificationResolver implements IProjectionStage {
  execute(context: ProjectionContext, currentGeometry: ProjectedGeometry | null): ProjectedGeometry {
    if (!currentGeometry) throw new Error("SimplificationResolver requires previous geometry");
    
    // Future: reduce points from curves/splines, drop micro-details like fillet radii if scale is too small
    
    return currentGeometry;
  }
}
