//        (270)
//          N
//  (180)W     E(0, 360)
//          S
//        (90)

import {Angle} from './angle.model';
import {Point} from "./point.model";

export type DirectionVal = 270 | 0 | 90 | 180 | 315 | 225 | 45 | 135;

export class Direction {
  static get N(): 270 {
    return 270;
  }

  static get E(): 0 {
    return 0;
  }

  static get S() : 90 {
    return 90;
  }

  static get W() : 180 {
    return 180;
  }

  static get NE(): 315 {
    return 315;
  }

  static get NW(): 225 {
    return 225;
  }

  static get SE():45 {
    return 45;
  }

  static get SW():135 {
    return 135;
  }

  static calcSnappedAngle(angle: Angle): DirectionVal {
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
    throw new Error(`Invalid angle ${angle.radianAngle}`);
  }

  static getDirection(startPoint: Point, endPoint: Point): DirectionVal {
    const angle = Angle.angle(startPoint, endPoint);
    return Direction.calcSnappedAngle(angle);
  }
  static get directions(): DirectionVal[] {
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

  static get randomDirection(): DirectionVal {
    return Direction.directions[
      Math.floor(Math.random() * Direction.directions.length)
      ];
  }
}
