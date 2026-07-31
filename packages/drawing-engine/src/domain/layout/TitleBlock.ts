export class RevisionEntry {
  constructor(
    public readonly revisionId: string,
    public readonly date: string,
    public readonly description: string,
    public readonly author: string,
    public readonly checkedBy: string
  ) {}
}

export class TitleBlock {
  constructor(
    public readonly projectName: string,
    public readonly client: string,
    public readonly revision: string,
    public readonly checkedBy: string,
    public readonly approvedBy: string,
    public readonly issueDate: string,
    public readonly scale: string,
    public readonly sheetNumber: string,
    public readonly rulePack: string,
    public readonly units: string
  ) {}
}
