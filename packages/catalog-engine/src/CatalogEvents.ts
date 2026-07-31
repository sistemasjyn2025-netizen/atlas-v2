/**
 * Represents the base interface for all catalog events.
 * (EventBus integration will be added in a future milestone).
 */
export interface CatalogEvent {
  type: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface CatalogLoaded extends CatalogEvent {
  type: 'CatalogLoaded';
  payload: {
    catalogId: string;
    providerId: string;
  };
}

export interface CatalogInvalidated extends CatalogEvent {
  type: 'CatalogInvalidated';
  payload: {
    catalogId?: string;
  };
}

export interface CatalogUpdated extends CatalogEvent {
  type: 'CatalogUpdated';
  payload: {
    catalogId: string;
    itemsCount: number;
  };
}

export interface ProviderChanged extends CatalogEvent {
  type: 'ProviderChanged';
  payload: {
    providerId: string;
  };
}
