import { Point } from './point.model';

export class Letter {
  font: string;
  private constructor(
    private _letter: string,
    private _point: Point,
    private _width: number,
    private wordColor: string,
    private boxColor: string
  ) {
    this.font = '20px sans-serif';
  }

  static from(
    letter: string,
    point: Point,
    width: number,
    wordColor = 'rgb(2, 2, 58)',
    boxColor = 'rgb(218, 228, 240)'
  ) {
    return new Letter(letter, point, width, wordColor, boxColor);
  }
  update(
    letter: string,
    point?: Point,
    width?: number,
    wordColor?: string,
    boxColor?: string
  ) {
    this._letter = letter;
    if (point) this._point = point;
    if (width) this._width = width;
    if (wordColor) this.wordColor = wordColor;
    if (boxColor) this.boxColor = boxColor;
  }
  updateColors(boxColor: string, wordColor?: string) {
    this.boxColor = boxColor;
    if (wordColor) this.wordColor = wordColor;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.fillStyle = this.boxColor;
    ctx.fillRect(this._point.x, this._point.y, this._width, this.height);
    ctx.strokeStyle = this.wordColor;
    ctx.strokeRect(this._point.x, this._point.y, this._width, this.height);
    const letterCenter = this.calcLetterCenteredPoint(ctx);
    ctx.font = this.font;
    ctx.fillStyle = this.wordColor;
    ctx.fillText(this._letter, letterCenter.x, letterCenter.y);
  }

  get letter() {
    return this._letter;
  }
  get height() {
    return this._width;
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

  static get arabicLetters() {
    // prettier-ignore
    return ["أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"];
  }
  static get englishLetters() {
    // prettier-ignore
    return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  }
  static getRandomLetter(lang = 'ar') {
    if (lang === 'ar') {
      return Letter.arabicLetters[
        Math.floor(Math.random() * Letter.arabicLetters.length)
      ];
    } else {
      return Letter.englishLetters[
        Math.floor(Math.random() * Letter.englishLetters.length)
      ];
    }
  }
}
