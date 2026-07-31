import { INodeTopology, IConnectionDetail } from '../domain/ConnectionDTOs';

export interface IConnectionSolver {
  canResolve(topology: INodeTopology): boolean;
  resolve(topology: INodeTopology): IConnectionDetail;
}
