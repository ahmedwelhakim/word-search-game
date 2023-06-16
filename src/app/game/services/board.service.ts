import {Injectable} from '@angular/core';
import {Angle} from '../models/angle.model';
import {Direction, DirectionVal} from '../models/directions.model';
import {Letter} from '../models/letter.model';
import {Point} from '../models/point.model';
import {CanvasService} from './canvas.service';

@Injectable()
export class BoardService {
  ctx: CanvasRenderingContext2D;
  letterVals: string[][] = [];
  letters: Letter[][] = [];
  lang = 'ar';
  private _offsetX = 0;
  private _offsetY = 0;
  private _boxSize = 0;
  private usedLetterIndexesMap = new Map<string, string>();

  constructor(private canvasService: CanvasService) {
    this.ctx = this.canvasService.ctx;
  }

  private initLetterVals(rows: number, cols: number) {
    // Fill the board with random letters
    this.letterVals = [];

    for (let i = 0; i < rows; i++) {
      this.letterVals.push([]);
      for (let j = 0; j < cols; j++) {
        this.letterVals[i].push(Letter.getRandomLetter(this.lang));
      }
    }
  }

  private initLetter(rows: number, cols: number) {
    this.letters = [];

    for (let i = 0; i < rows; i++) {
      this.letters.push([]);
      for (let j = 0; j < cols; j++) {
        this.letters[i].push(
          Letter.from(this.letterVals[i][j], Point.from(0, 0), 0)
        );
      }
    }
  }

  fillBoard(rows: number, cols: number, words: string[]) {
    this.initLetterVals(rows, cols);
    this.initLetter(rows, cols);

    for (let word of words) {
      const randDir = Direction.randomDirection;
      const [startI, startJ] = this.getValidRandomBeginningIndex(word, randDir);
      this.fillWord(word, startI, startJ, randDir);
    }
    this.updateLettersAndSizes();
  }

  private fillWord(word: string, i: number, j: number, dir: DirectionVal) {
    const len = word.length;
    const wordLettersReversed = word.split('').reverse();
    this.doInDirection(dir, i, j, len, (i, j) => {
      const letter = wordLettersReversed.pop()!;
      this.letterVals[i][j] = letter;
      this.letters[i][j].updateColors('khaki');
      this.usedLetterIndexesMap.set(`${i},${j}`, letter);
    });
  }

  private getValidRandomBeginningIndex(
    word: string,
    direction: DirectionVal
  ): [number, number] {
    let randI = Math.floor(Math.random() * this.rows);
    let randJ = Math.floor(Math.random() * this.cols);
    while (!this.isValidIndex(randI, randJ, word, direction)) {
      randI = Math.floor(Math.random() * this.rows);
      randJ = Math.floor(Math.random() * this.cols);
    }
    return [randI, randJ];
  }

  private isValidIndex(i: number, j: number, word: string, direction: DirectionVal) {
    const len = word.length;
    const max_cols = this.cols;
    const max_rows = this.rows;
    let result = false;
    switch (direction) {
      case Direction.N:
        result = i >= len - 1;
        break;
      case Direction.S:
        result = i <= max_rows - len;
        break;
      case Direction.E:
        result = j <= max_cols - len;
        break;
      case Direction.W:
        result = j >= len - 1;
        break;
      case Direction.NE:
        result = i >= len - 1 && j <= max_cols - len;
        break;
      case Direction.SE:
        result = i <= max_rows - len && j <= max_cols - len;
        break;
      case Direction.NW:
        result = i >= len - 1 && j >= len - 1;
        break;
      case Direction.SW:
        result = i <= max_rows - len && j >= len - 1;
        break;
    }
    if (!result) return false;

    // Handle the case if letter will override other valid word letter
    this.doInDirection(direction, i, j, len, (i2, j2, counter) => {
      if (
        this.usedLetterIndexesMap.has(`${i2},${j2}`) &&
        this.usedLetterIndexesMap.get(`${i2},${j2}`) !== word[counter]
      ) {
        result = false;
      }
    });
    return result;
  }

  draw() {
    this.ctx.beginPath();
    for (let row of this.letters) {
      for (let letter of row) {
        letter.draw(this.ctx);
      }
    }
  }

  updateLettersAndSizes() {
    const width = this.canvasService.canvas.width / this.cols;
    const height = this.canvasService.canvas.height / this.rows;
    this._boxSize = Math.min(width, height);

    this._offsetX = ((width - this.boxSize) * this.cols) / 2;
    this._offsetY = ((height - this.boxSize) * this.rows) / 2;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.letters[i][j].update(
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

    const j = Math.round((point.x + offsetX) / this.boxSize);

    const i = Math.round((point.y + offsetY) / this.boxSize);

    return [i, j];
  }

  isInBoard(...points: Point[]): boolean {
    for (let point of points) {
      if (point.x < this.topLeftPoint.x || point.x > this.bottomRightPoint.x)
        return false;
      if (point.y < this.topLeftPoint.y || point.y > this.bottomRightPoint.y)
        return false;
    }
    return true;
  }

  getWord(startPoint: Point, endPoint: Point): string {
    if (!this.isInBoard(startPoint) || !this.isInBoard(endPoint)) return '';
    const [i1, j1] = this.translatePointToIndices(startPoint);
    const [i2, j2] = this.translatePointToIndices(endPoint);

    const direction = Direction.getDirection(startPoint, endPoint);
    let res: string[] = [];
    const distanceLength = Math.max(Math.abs(i2 - i1), Math.abs(j2 - j1)) + 1;
    if (i1 === i2 && j1 === j2) return this.letterVals?.[i1]?.[j1] || '';
    res = this.doInDirection(direction, i1, j1, distanceLength, (i, j) => {
      return this.letterVals?.[i]?.[j] || '';
    });

    return res.join('');
  }

  doInDirection<T extends any>(
    direction: DirectionVal,
    startI: number,
    startJ: number,
    len: number,
    fn: (i: number, j: number, counter: number) => T
  ) {
    const res: T[] = [];
    let endI: number;
    let endJ: number;
    let diff;
    let counter = 0;
    switch (direction) {
      // from Left To Right
      case Direction.E:
        endJ = startJ + len - 1;
        for (let j = startJ; j <= endJ; j++) {
          res.push(fn(startI, j, counter++));
        }
        break;
      // from Right To Left
      case Direction.W:
        endJ = startJ - len + 1;
        for (let j = startJ; j >= endJ; j--) {
          res.push(fn(startI, j, counter++));
        }
        break;

      // from Top to Bottom
      case Direction.S:
        endI = startI + len - 1;
        for (let i = startI; i <= endI; i++) {
          res.push(fn(i, startJ, counter++));
        }
        break;
      // from Bottom to Top
      case Direction.N:
        endI = startI - len + 1;
        for (let i = startI; i >= endI; i--) {
          res.push(fn(i, startJ, counter++));
        }
        break;

      // i is decreasing
      // j is increasing
      case Direction.NE:
        endJ = startJ + len - 1;
        diff = Math.abs(endJ - startJ);
        for (let i = 0; i <= diff; i++) {
          res.push(fn(startI - i, startJ + i, counter++));
        }
        break;
      // i is increasing
      // j is decreasing
      case Direction.SW:
        endJ = startJ - len + 1;
        diff = Math.abs(endJ - startJ);
        for (let i = 0; i <= diff; i++) {
          res.push(fn(startI + i, startJ - i, counter++));
        }
        break;
      // i is decreasing
      // j is decreasing
      case Direction.NW:
        endJ = startJ - len + 1;
        diff = Math.abs(endJ - startJ);
        for (let i = 0; i <= diff; i++) {
          res.push(fn(startI - i, startJ - i, counter++));
        }
        break;

      // i is increasing
      // j is increasing
      case Direction.SE:
        endJ = startJ + len - 1;
        diff = Math.abs(endJ - startJ);
        for (let i = 0; i <= diff; i++) {
          res.push(fn(startI + i, startJ + i, counter++));
        }
        break;
    }
    return res;
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
    return this.letterVals.length;
  }

  get cols() {
    return this.letterVals?.[0]?.length || 0;
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
