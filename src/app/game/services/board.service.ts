import { Injectable } from '@angular/core';
import { Direction } from '../models/directions.model';
import { Letter } from '../models/letter.model';
import { Point } from '../models/point.model';
import { CanvasService } from './canvas.service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  ctx: CanvasRenderingContext2D;
  letterVals: string[][] = [];
  letters: Letter[][] = [];
  private _offsetX = 0;
  private _offsetY = 0;
  private _boxSize = 0;
  private _cols = 0;
  private _rows = 0;

  constructor(private canvasService: CanvasService) {
    this.ctx = this.canvasService.ctx;

    this.letterVals = [
      ['A', 'B', 'C', 'D'],
      ['E', 'F', 'G', 'H'],
      ['I', 'J', 'K', 'L'],
      ['M', 'N', 'O', 'P'],
      ['M', 'N', 'O', 'P'],
      ['Q', 'R', 'S', 'T'],
      ['U', 'Q', 'R', 'S'],
      ['V', 'W', 'X', 'Y'],
    ];
    this._rows = this.letterVals.length;
    this._cols = this.letterVals[0].length;

    // Init the letters array with Empty letters
    this.letters = [];
    for (let i = 0; i < this.rows; i++) {
      this.letters.push([]);
    }

    this.updateSizes();
  }

  draw() {
    this.ctx.beginPath();
    for (let row of this.letters) {
      for (let letter of row) {
        letter.draw(this.ctx);
      }
    }
  }
  updateSizes() {
    const width = this.canvasService.canvas.width / this.cols;
    const height = this.canvasService.canvas.height / this.rows;
    this._boxSize = Math.min(width, height);

    this._offsetX = ((width - this.boxSize) * this.cols) / 2;
    this._offsetY = ((height - this.boxSize) * this.rows) / 2;
    console.log(this._offsetX, this._offsetY);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.letters[i][j] = Letter.from(
          this.letterVals[i][j],
          Point.from(
            j * this.boxSize + this.offsetX,
            i * this.boxSize + this.offsetY
          ),
          this.boxSize
        );
      }
    }
  }
  private translatePointToIndices(point: Point): [number, number] {
    // Remove all offsets
    let offsetX = -this.boxSize / 2;
    offsetX -= this._offsetX;
    let offsetY = -this.boxSize / 2;
    offsetY -= this._offsetY;

    const j = Math.floor((point.x + offsetX) / this.boxSize);
    const i = Math.floor((point.y + offsetY) / this.boxSize);
    return [i, j];
  }

  getWord(startPoint: Point, endPoint: Point): string {
    if (startPoint.x === -1) return '';
    const [i1, j1] = this.translatePointToIndices(startPoint);
    const [i2, j2] = this.translatePointToIndices(endPoint);

    const direction = Direction.calcSnappedAngle(
      Point.angle(startPoint, endPoint)
    );
    let res = [];
    if (i1 === i2 && j1 === j2) return this.letterVals[i1][j1];
    let diff = 0;
    switch (direction) {
      // from Left To Right
      case Direction.E:
        for (let j = j1; j <= j2; j++) {
          res.push(this.letterVals[i1][j]);
        }
        break;
      // from Right To Left
      case Direction.W:
        for (let j = j1; j >= j2; j--) {
          res.push(this.letterVals[i1][j]);
        }
        break;

      // from Top to Bottom
      case Direction.S:
        for (let i = i1; i <= i2; i++) {
          res.push(this.letterVals[i][j1]);
        }
        break;
      // from Bottom to Top
      case Direction.N:
        for (let i = i1; i >= i2; i--) {
          res.push(this.letterVals[i][j1]);
        }
        break;

      // i is decreasing
      // j is increasing
      case Direction.NE:
        diff = Math.abs(j2 - j1);
        for (let i = 0; i <= diff; i++) {
          res.push(this.letterVals[i1 - i][j1 + i]);
        }
        break;
      // i is increasing
      // j is decreasing
      case Direction.SW:
        diff = Math.abs(j2 - j1);
        for (let i = 0; i <= diff; i++) {
          res.push(this.letterVals[i1 + i][j1 - i]);
        }
        break;
      // i is decreasing
      // j is decreasing
      case Direction.NW:
        diff = Math.abs(j2 - j1);
        for (let i = 0; i <= diff; i++) {
          res.push(this.letterVals[i1 - i][j1 - i]);
        }
        break;

      // i is increasing
      // j is increasing
      case Direction.SE:
        diff = Math.abs(j2 - j1);
        for (let i = 0; i <= diff; i++) {
          res.push(this.letterVals[i1 + i][j1 + i]);
        }
        break;
    }

    return res.join('');
  }

  get offsetX() {
    return this._offsetX;
  }
  get offsetY() {
    return this._offsetY;
  }

  get boxSize() {
    return this._boxSize;
  }
  get rows() {
    return this._rows;
  }
  get cols() {
    return this._cols;
  }
  get topLeftPoint() {
    return Point.from(this.offsetX, this.offsetY);
  }
  get topRightPoint() {
    return Point.from(this.offsetX + this.boxSize * this.cols, this.offsetY);
  }
  get bottomLeftPoint() {
    return Point.from(this.offsetX, this.offsetY + this.boxSize * this.rows);
  }
  get bottomRightPoint() {
    return Point.from(
      this.offsetX + this.boxSize * this.cols,
      this.offsetY + this.boxSize * this.rows
    );
  }
}
