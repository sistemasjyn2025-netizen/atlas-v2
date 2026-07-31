import { DeliverableFile } from './DeliverableFile';

export class DocumentPackage {
  constructor(
    private readonly files: ReadonlyArray<DeliverableFile>,
    private readonly projectId: string,
    private readonly version: string
  ) {}

  public getFiles(): ReadonlyArray<DeliverableFile> {
    return this.files;
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getVersion(): string {
    return this.version;
  }
}
