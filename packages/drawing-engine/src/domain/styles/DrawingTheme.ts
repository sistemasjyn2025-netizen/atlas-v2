import { LayerStyle, TextStyle, DimensionStyle, CompanyBranding } from './Styles';

export class DrawingTheme {
  private layers: Map<string, LayerStyle> = new Map();
  private textStyles: Map<string, TextStyle> = new Map();
  private dimensionStyles: Map<string, DimensionStyle> = new Map();

  constructor(
    public readonly id: string,
    public readonly name: string, // e.g. "IRAM Standard"
    public readonly branding?: CompanyBranding
  ) {}

  public addLayer(layer: LayerStyle): void {
    this.layers.set(layer.id, layer);
  }

  public getLayer(id: string): LayerStyle | undefined {
    return this.layers.get(id);
  }

  public addTextStyle(style: TextStyle): void {
    this.textStyles.set(style.id, style);
  }

  public getTextStyle(id: string): TextStyle | undefined {
    return this.textStyles.get(id);
  }

  public addDimensionStyle(style: DimensionStyle): void {
    this.dimensionStyles.set(style.id, style);
  }

  public getDimensionStyle(id: string): DimensionStyle | undefined {
    return this.dimensionStyles.get(id);
  }
}
