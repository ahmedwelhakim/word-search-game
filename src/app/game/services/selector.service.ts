import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Point } from '../models/point.model';
import { BoardService } from './board.service';
import { CanvasService } from './canvas.service';
import { InputHandlerService } from './input-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectorService implements OnDestroy {
  private ctx: CanvasRenderingContext2D;
  private startPoint = Point.from(0, 0);
  private endPoint = Point.from(0, 0);

  private subscriptions = new Subscription();

  constructor(
    private canvasService: CanvasService,
    private inputHandler: InputHandlerService,
    private boardService: BoardService
  ) {
    this.ctx = this.canvasService.ctx;
    const sub1 = this.inputHandler.startEndPoints$.subscribe(
      ([startPoint, endPoint]) => {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
      }
    );
    this.subscriptions.add(sub1);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    console.log('Selector Service Destroyed');
  }

  draw() {
    if (!this.boardService.isInBoard(this.startPoint, this.endPoint)) {
      return;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(this.startPoint.x, this.startPoint.y);

    this.ctx.lineTo(this.endPoint.x, this.endPoint.y);
    this.ctx.fillStyle = 'red';
    this.ctx.fill();
  }
}
