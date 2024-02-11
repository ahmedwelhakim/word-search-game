import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardService } from './services/board.service';
import { CanvasService } from './services/canvas.service';
import { GameService } from './services/game.service';
import { InputHandlerService } from './services/input-handler.service';
import { SelectorService } from './services/selector.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    GameService,
    BoardService,
    CanvasService,
    InputHandlerService,
    SelectorService,
  ],
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true })
  canvasContainerRef!: ElementRef<HTMLDivElement>;

  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  boardSize!: number;
  animationFrameNumber = -1;
  subscriptions = new Subscription();

  constructor(
    private ngZone: NgZone,
    private canvasService: CanvasService,
    private inputHandlerService: InputHandlerService,
    private selectorService: SelectorService,
    private boardService: BoardService,
    protected gameService: GameService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ngAfterViewInit(): void {
    // getting canvas from the service
    this.canvas = this.canvasService.canvas;
    this.canvasContainerRef.nativeElement.appendChild(this.canvas);
    this.ctx = this.canvasService.ctx;
    this.onResize();

    const sub1 = this.inputHandlerService.pressed$.subscribe((pressed) => {
      if (pressed) {
        this.animationFrameNumber = requestAnimationFrame(
          this.gameLoop.bind(this)
        );
      }
      if (!pressed) {
        cancelAnimationFrame(this.animationFrameNumber);
      }
    });
    this.subscriptions.add(sub1);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'skyblue';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.boardService.draw();
    this.selectorService.draw();
  }
  gameLoop() {
    this.draw();
    this.animationFrameNumber = requestAnimationFrame(this.gameLoop.bind(this));
  }

  @HostListener('window:resize')
  onResize() {
    this.updateBoardSize();
    this.boardService.updateLettersAndSizes();
    this.draw();
  }

  private updateBoardSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const minDimension = Math.min(width, height);
    this.boardSize = minDimension * 0.9;
    this.canvas.width = this.boardSize;
    this.canvas.height = this.boardSize;
  }
}
