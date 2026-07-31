import { Viewport } from './Viewport';
import { PaperFormat } from './PaperFormat';
import { TitleBlock, RevisionEntry } from './TitleBlock';

export class DrawingSheet {
  private viewports: Viewport[] = [];
  private revisions: RevisionEntry[] = [];

  constructor(
    public readonly id: string,
    public readonly paperFormat: PaperFormat,
    public titleBlock: TitleBlock | null = null
  ) {}

  public setTitleBlock(titleBlock: TitleBlock): void {
    this.titleBlock = titleBlock;
  }

  public addViewport(viewport: Viewport): void {
    this.viewports.push(viewport);
  }

  public getViewports(): ReadonlyArray<Viewport> {
    return this.viewports;
  }

  public addRevision(revision: RevisionEntry): void {
    this.revisions.push(revision);
  }

  public getRevisions(): ReadonlyArray<RevisionEntry> {
    return this.revisions;
  }
}

