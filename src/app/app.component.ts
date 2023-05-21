import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameService } from './game/services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'word-matcher';

  constructor(protected gameService: GameService) {}
}
