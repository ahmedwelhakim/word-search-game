import {
  Injectable,
  OnDestroy,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Angle } from '../models/angle.model';
import { Direction } from '../models/directions.model';
import { Point } from '../models/point.model';
import { BoardService } from './board.service';
import { CanvasService } from './canvas.service';

@Injectable({
  providedIn: 'root',
})
export class InputHandlerService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private _startPoint$ = new BehaviorSubject<Point>(Point.from(-1, -1));
  private _endPoint$ = new BehaviorSubject<Point>(Point.from(-1, -1));
  private _pressed$ = new BehaviorSubject<boolean>(false);
  private unlisitners: (() => void)[] = [];
  private renderer: Renderer2;
  constructor(
    private canvasService: CanvasService,
    private boardService: BoardService,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.canvas = this.canvasService.canvas;
    this.unlisitners = this.moveWhilePressDown((event) => {
      let endPoint = this.getPointFromEvent(event);
      endPoint = this.getSnappedPoint(endPoint);
      endPoint = this.getQuantizedPoint(endPoint);
      if (
        endPoint.x !== this._endPoint$.value.x ||
        endPoint.y !== this._endPoint$.value.y
      ) {
        this._endPoint$.next(endPoint);
      }
    });
  }
  ngOnDestroy(): void {
    this.unlistenTo(...this.unlisitners);
    console.log('Input Handler Service Destroyed');
  }

  get startEndPoints$() {
    return this._endPoint$
      .asObservable()
      .pipe(map((point): [Point, Point] => [this._startPoint$.value, point]));
  }

  get pressed$() {
    return this._pressed$.asObservable();
  }
  private getSnappedPoint(endPoint: Point): Point {
    let newX = endPoint.x;
    let newY = endPoint.y;
    let angle = Point.angle(this._startPoint$.value, endPoint);
    const snappedAngle = Direction.calcSnappedAngle(angle);

    // Horizontal Line
    if (snappedAngle === Direction.E || snappedAngle === Direction.W) {
      newY = this._startPoint$.value.y + 1; // This 1 as for some unknown reason it does not draw anything when both equal
    }

    // Vertical Line
    else if (snappedAngle == Direction.N || snappedAngle == Direction.S) {
      newX = this._startPoint$.value.x + 1;
    }
    // 45 degree line
    else {
      const distance = Point.distance(this._startPoint$.value, endPoint);
      const dx = endPoint.x - this._startPoint$.value.x;
      const dy = endPoint.y - this._startPoint$.value.y;
      const signX = dx > 0 ? 1 : -1;
      const signY = dy > 0 ? 1 : -1;
      newX =
        this._startPoint$.value.x +
        distance * Angle.cos(Angle.fromDeg(45)) * signX;
      newY =
        this._startPoint$.value.y +
        distance * Angle.sin(Angle.fromDeg(45)) * signY;
    }

    return Point.from(newX, newY);
  }
  private getQuantizedPoint(point: Point): Point {
    const boxSize = this.boardService.boxSize;
    const offsetX = boxSize / 2;
    const offsetY = boxSize / 2;
    let x = Math.floor(point.x / boxSize) * boxSize + offsetX;
    let y = Math.floor(point.y / boxSize) * boxSize + offsetY;
    return Point.from(x, y);
  }
  private moveWhilePressDown(whileMove: (event: MouseEvent) => void) {
    let unlistenMouseUpFn: () => void;
    let unlistenMouseMoveFn: () => void;
    let unlistenTouchMoveFn: () => void;
    let unlistenTouchUpFn: () => void;

    const endMove = () => {
      this._pressed$.next(false);
      this.unlistenTo(
        unlistenMouseMoveFn,
        unlistenTouchMoveFn,
        unlistenMouseUpFn,
        unlistenTouchUpFn
      );
    };

    const unlistenMouseDownFn = this.renderer.listen(
      this.canvas,
      'mousedown',
      (event) => {
        event.stopPropagation();

        // First click is handled here
        let point = this.getPointFromEvent(event);
        point = this.getQuantizedPoint(point);
        this._startPoint$.next(point);
        this._pressed$.next(true);

        unlistenMouseMoveFn = this.renderer.listen(
          this.canvas,
          'mousemove',
          whileMove
        );
        unlistenMouseUpFn = this.renderer.listen(window, 'mouseup', endMove);
      }
    );

    const unlistenTouchDownFn = this.renderer.listen(
      this.canvas,
      'touchstart',
      (event) => {
        event.stopPropagation();
        // First click is handled here
        const point = this.getPointFromEvent(event);
        this._startPoint$.next(point);
        this._pressed$.next(true);

        unlistenTouchMoveFn = this.renderer.listen(
          this.canvas,
          'touchmove',
          whileMove
        );
        unlistenTouchUpFn = this.renderer.listen(window, 'touchend', endMove);
      }
    );
    return [unlistenMouseDownFn, unlistenTouchDownFn];
  }

  private getPointFromEvent(event: MouseEvent | TouchEvent) {
    let offsetX = 0;
    let offsetY = 0;
    if (event instanceof MouseEvent) {
      offsetX = event.offsetX;
      offsetY = event.offsetY;
    }
    if (event instanceof TouchEvent) {
      const boundRect = this.canvas.getBoundingClientRect();
      offsetX = event.touches[0].clientX - boundRect.left;
      offsetY = event.touches[0].clientY - boundRect.top;
    }
    return Point.from(offsetX, offsetY);
  }
  private unlistenTo(...unlistenFns: ((() => void) | undefined)[]) {
    for (let unlistener of unlistenFns) {
      if (unlistener) {
        unlistener();
      }
    }
  }
}
