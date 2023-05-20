import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { BoardService } from './board.service';
import { InputHandlerService } from './input-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameService implements OnDestroy {
  private _selectedWord = new BehaviorSubject<string>('');
  private subscriptions = new Subscription();

  constructor(
    private inputHandler: InputHandlerService,
    private boardService: BoardService
  ) {
    this.subscriptions.add(
      this.inputHandler.startEndPoints$.subscribe(([startPoint, endPoint]) => {
        this._selectedWord.next(
          this.boardService.getWord(startPoint, endPoint)
        );
      })
    );
  }
  ngOnDestroy(): void {
    console.log('Board Service Destroyed');
    this.subscriptions.unsubscribe();
  }
  get selectedWord$() {
    return this._selectedWord.asObservable();
  }
}
