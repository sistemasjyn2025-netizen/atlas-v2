export enum PaperOrientation {
  Portrait = 'Portrait',
  Landscape = 'Landscape'
}

export class PaperFormat {
  constructor(
    public readonly name: string,
    public readonly width: number, // in mm
    public readonly height: number, // in mm
    public readonly orientation: PaperOrientation
  ) {}

  public get isLandscape(): boolean {
    return this.orientation === PaperOrientation.Landscape;
  }

  // Dimensions based on ISO A series (in mm)
  // When landscape, width is the larger dimension
  
  public static readonly A0_Landscape = new PaperFormat("A0", 1189, 841, PaperOrientation.Landscape);
  public static readonly A0_Portrait = new PaperFormat("A0", 841, 1189, PaperOrientation.Portrait);
  
  public static readonly A1_Landscape = new PaperFormat("A1", 841, 594, PaperOrientation.Landscape);
  public static readonly A1_Portrait = new PaperFormat("A1", 594, 841, PaperOrientation.Portrait);
  
  public static readonly A2_Landscape = new PaperFormat("A2", 594, 420, PaperOrientation.Landscape);
  public static readonly A2_Portrait = new PaperFormat("A2", 420, 594, PaperOrientation.Portrait);
  
  public static readonly A3_Landscape = new PaperFormat("A3", 420, 297, PaperOrientation.Landscape);
  public static readonly A3_Portrait = new PaperFormat("A3", 297, 420, PaperOrientation.Portrait);
  
  public static readonly A4_Landscape = new PaperFormat("A4", 297, 210, PaperOrientation.Landscape);
  public static readonly A4_Portrait = new PaperFormat("A4", 210, 297, PaperOrientation.Portrait);
}
