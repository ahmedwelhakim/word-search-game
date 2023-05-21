//        (270)
//          N
//  (180)W     E(0, 360)
//          S
//        (90)

import { Angle } from './angle.model';

export class Direction {
  static get N() {
    return 270;
  }
  static get E() {
    return 0;
  }
  static get S() {
    return 90;
  }
  static get W() {
    return 180;
  }
  static get NE() {
    return 315;
  }
  static get NW() {
    return 225;
  }
  static get SE() {
    return 45;
  }
  static get SW() {
    return 135;
  }

  static calcSnappedAngle(angle: Angle): number {
    if (
      angle.degreeAngle >= Direction.NE + 45 / 2 ||
      angle.degreeAngle <= Direction.SE - 45 / 2
    )
      return Direction.E;

    if (
      angle.degreeAngle >= Direction.NW + 45 / 2 &&
      angle.degreeAngle <= Direction.NE - 45 / 2
    )
      return Direction.N;

    if (
      angle.degreeAngle >= Direction.SW + 45 / 2 &&
      angle.degreeAngle <= Direction.NW - 45 / 2
    )
      return Direction.W;

    if (
      angle.degreeAngle >= Direction.SE + 45 / 2 &&
      angle.degreeAngle <= Direction.SW - 45 / 2
    )
      return Direction.S;

    if (
      angle.degreeAngle >= Direction.NE - 45 / 2 &&
      angle.degreeAngle <= Direction.NE + 45 / 2
    )
      return Direction.NE;

    if (
      angle.degreeAngle >= Direction.NW - 45 / 2 &&
      angle.degreeAngle <= Direction.NW + 45 / 2
    )
      return Direction.NW;

    if (
      angle.degreeAngle >= Direction.SW - 45 / 2 &&
      angle.degreeAngle <= Direction.SW + 45 / 2
    )
      return Direction.SW;

    if (
      angle.degreeAngle >= Direction.SE - 45 / 2 &&
      angle.degreeAngle <= Direction.SE + 45 / 2
    )
      return Direction.SE;

    // It should never reach here
    throw new Error('Invalid angle');
  }
  static get directions() {
    return [
      Direction.E,
      Direction.W,
      Direction.S,
      Direction.NE,
      Direction.NW,
      Direction.SW,
      Direction.SE,
    ];
  }
  static get randomDirection() {
    return Direction.directions[
      Math.floor(Math.random() * Direction.directions.length)
    ];
  }
}
