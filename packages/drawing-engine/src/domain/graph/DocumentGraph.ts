export interface DrawingReference {
  viewId: string;
  viewportId?: string;
  sheetId?: string;
  annotationIds: string[];
}

export class DocumentNode {
  private references: DrawingReference[] = [];

  constructor(
    public readonly entityId: string // e.g. pipeline member ID or connection ID
  ) {}

  public addReference(ref: DrawingReference): void {
    this.references.push(ref);
  }

  public getReferences(): ReadonlyArray<DrawingReference> {
    return this.references;
  }
}

export class DocumentGraph {
  private nodes: Map<string, DocumentNode> = new Map();

  public getOrCreateNode(entityId: string): DocumentNode {
    let node = this.nodes.get(entityId);
    if (!node) {
      node = new DocumentNode(entityId);
      this.nodes.set(entityId, node);
    }
    return node;
  }

  public getNode(entityId: string): DocumentNode | undefined {
    return this.nodes.get(entityId);
  }

  public getAllNodes(): DocumentNode[] {
    return Array.from(this.nodes.values());
  }
}
