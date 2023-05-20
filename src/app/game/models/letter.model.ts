import { Point } from './point.model';

export class Letter {
  color = 'white';
  private _height: number;
  private constructor(
    private _letter: string,
    private _point: Point,
    private _width: number
  ) {
    this._height = this._width;
  }

  static from(letter: string, point: Point, width: number) {
    return new Letter(letter, point, width);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this._point.x, this._point.y, this._width, this._height);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this._point.x, this._point.y, this._width, this._height);
    const letterCenter = this.calcLetterCenteredPoint(ctx);
    ctx.strokeText(this._letter, letterCenter.x, letterCenter.y);
  }

  get letter() {
    return this._letter;
  }
  get height() {
    return this._height;
  }
  get width() {
    return this._width;
  }
  get topLeftPoint() {
    return this._point;
  }
  get topRightPoint() {
    return this._point.add(this.width, 0);
  }
  get bottomLeftPoint() {
    return this._point.add(0, this.height);
  }
  get bottomRightPoint() {
    return this._point.add(this.width, this.height);
  }
  get centerPoint() {
    return this._point.add(this.width / 2, this.height / 2);
  }
  private calcLetterCenteredPoint(ctx: CanvasRenderingContext2D) {
    const metrics = ctx.measureText(this._letter);
    const center = this.centerPoint;
    const actualHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const width = metrics.width;
    return center.add(-width / 2, actualHeight / 2);
  }
}
