import {
  Inject,
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

@Injectable()
export class InputHandlerService implements OnDestroy {
  private readonly canvas: HTMLCanvasElement;
  private _startPoint$ = new BehaviorSubject<Point>(Point.from(-1, -1));
  private _endPoint$ = new BehaviorSubject<Point>(Point.from(-1, -1));
  private _pressed$ = new BehaviorSubject<boolean>(false);
  private readonly unlisitners: (() => void)[] = [];
  private renderer: Renderer2;

  constructor(
    private canvasService: CanvasService,
    private boardService: BoardService,
    private rendererFactory: RendererFactory2,
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

  get direction$() {
    return this.startEndPoints$.pipe(
      map(([startPoint, endPoint]) =>
        Direction.getDirection(startPoint, endPoint)
      )
    );
  }
  get pressed$() {
    return this._pressed$.asObservable();
  }
  private getSnappedPoint(endPoint: Point): Point {
    let newX = endPoint.x;
    let newY = endPoint.y;
    let angle = Angle.angle(this._startPoint$.value, endPoint);
    const snappedAngle = Direction.calcSnappedAngle(angle);

    // Horizontal Line
    if (snappedAngle === Direction.E || snappedAngle === Direction.W) {
      newY = this._startPoint$.value.y ;
    }

    // Vertical Line
    else if (snappedAngle == Direction.N || snappedAngle == Direction.S) {
      newX = this._startPoint$.value.x ;
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
    const halfBoxOffsetX = boxSize / 2;
    const halfBoxOffsetY = boxSize / 2;

    // *****************************************************************
    // translate points to Board Table to top left
    let x = point.x - this.boardService.offsetX;
    let y = point.y - this.boardService.offsetY;

    x = Math.floor(x / boxSize) * boxSize + halfBoxOffsetX;
    y = Math.floor(y / boxSize) * boxSize + halfBoxOffsetY;

    // ****************************************************************
    // translate points back to their original
    x += this.boardService.offsetX;
    y += this.boardService.offsetY;

    return Point.from(x, y);
  }
  private moveWhilePressDown(
    whileMove: (event: MouseEvent | TouchEvent) => void
  ) {
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
        event.preventDefault();
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
        event.preventDefault();
        // First click is handled here
        let point = this.getPointFromEvent(event);
        point = this.getQuantizedPoint(point);
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
    if ('MouseEvent' in window && event instanceof MouseEvent) {
      offsetX = event.offsetX;
      offsetY = event.offsetY;
    }
    if ( 'TouchEvent' in window && event instanceof TouchEvent) {
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
