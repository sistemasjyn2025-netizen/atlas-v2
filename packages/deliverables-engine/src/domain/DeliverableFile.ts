export interface DeliverableFile {
  id: string;
  category: string;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  version: string;
  createdAt: string;
  content: Uint8Array | string;
  blob?: Blob;
}
