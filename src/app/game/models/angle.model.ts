import { Point } from './point.model';

export class Angle {
  private radAngle;
  constructor(radAngle: number) {
    this.radAngle = radAngle;
  }

  get radianAngle() {
    return this.radAngle;
  }

  get degreeAngle() {
    return Math.round(Angle.radToDeg(this.radianAngle));
  }

  valueOf() {
    return this.radianAngle;
  }
  toString() {
    return `deg: ${this.degreeAngle}°, rad: ${this.radianAngle}rad`;
  }
  addDeg(degAngle: number) {
    return new Angle(this.radianAngle + Angle.degToRad(degAngle));
  }
  addRad(radAngle: number) {
    return new Angle(this.radianAngle + radAngle);
  }

  static degToRad(degAngle: number) {
    return (degAngle * Math.PI) / 180;
  }
  static radToDeg(radAngle: number) {
    return (radAngle * 180) / Math.PI;
  }
  static fromDeg(degAngle: number) {
    return new Angle(Angle.degToRad(degAngle));
  }
  static fromRad(radAngle: number) {
    return new Angle(radAngle);
  }
  static angle(p1: Point, p2: Point) {
    let angle = Angle.atan2(p2.y - p1.y, p2.x - p1.x);
    if (angle.degreeAngle < 0) angle = angle.addDeg(360);
    return angle;
  }
  static cos(angle: Angle) {
    return Math.cos(angle.radianAngle);
  }
  static sin(angle: Angle) {
    return Math.sin(angle.radianAngle);
  }
  static tan(angle: Angle) {
    return Math.tan(angle.radianAngle);
  }

  static atan2(y: number, x: number) {
    return Angle.fromRad(Math.atan2(y, x));
  }
}
