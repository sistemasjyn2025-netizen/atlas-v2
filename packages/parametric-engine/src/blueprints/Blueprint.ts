import { EntityManager } from '@atlas/kernel';

export interface Blueprint<TParams> {
  name: string;
  generate(params: TParams, entityManager: EntityManager, projectId: string, abortSignal?: AbortSignal): void;
}
