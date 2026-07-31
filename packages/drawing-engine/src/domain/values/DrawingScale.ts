export class DrawingScale {
  constructor(
    public readonly name: string,
    public readonly ratio: number
  ) {
    if (ratio <= 0) {
      throw new Error("Scale ratio must be positive");
    }
  }

  public get factor(): number {
    return 1 / this.ratio;
  }

  public static readonly Scale1_10 = new DrawingScale("1:10", 10);
  public static readonly Scale1_20 = new DrawingScale("1:20", 20);
  public static readonly Scale1_25 = new DrawingScale("1:25", 25);
  public static readonly Scale1_50 = new DrawingScale("1:50", 50);
  public static readonly Scale1_75 = new DrawingScale("1:75", 75);
  public static readonly Scale1_100 = new DrawingScale("1:100", 100);
  public static readonly Scale1_200 = new DrawingScale("1:200", 200);
}
