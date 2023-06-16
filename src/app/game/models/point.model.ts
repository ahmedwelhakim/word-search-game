export class Point {
  private constructor(private _x: number, private _y: number) {
  }

  static from(x: number, y: number) {
    return new Point(x, y);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  toString() {
    return `x: ${this._x}, y: ${this._y}`;
  }

  add(x: number, y: number) {
    return Point.from(this._x + x, this._y + y);
  }

  static distance(p1: Point, p2: Point) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  static slope(p1: Point, p2: Point) {
    return (p2.y - p1.y) / (p2.x - p1.x);
  }

}
