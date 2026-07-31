export enum EdgeVisibility {
  Visible = 'Visible',
  Hidden = 'Hidden',
  Clipped = 'Clipped',
  Silhouette = 'Silhouette'
}

export interface VisibilityMetadata {
  isVisible: boolean;
  edgeVisibility: EdgeVisibility;
  zDepth: number; // For front/back ordering
}
