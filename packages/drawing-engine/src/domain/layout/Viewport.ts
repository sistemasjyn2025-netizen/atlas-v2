import { DrawingScale } from '../values/DrawingScale';

export class Viewport {
  constructor(
    public readonly id: string,
    public readonly viewId: string,
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly scale: DrawingScale
  ) {}
}
