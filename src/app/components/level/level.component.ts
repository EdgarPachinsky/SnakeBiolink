import {Component, HostListener, Input, OnInit} from '@angular/core';
import {GameStateService} from "../../shared-state/game-state.service";
import {NgClass} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {SharedFunctionsService} from "../../services/shared-functions.service";

@Component({
  selector: 'app-level',
  standalone: true,
  imports: [
    NgClass,
    MatButton,
    MatTooltip
  ],
  templateUrl: './level.component.html',
})
export class LevelComponent implements OnInit{

  @Input() type: 'prev' | 'current' | 'next' = 'current';

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        if(!this.sharedFunctionsService.isOpposite(this.gameStateService.currentDirection,'up'))
          this.gameStateService.currentDirection = 'up'
        break;
      case 'ArrowDown':
        if(!this.sharedFunctionsService.isOpposite(this.gameStateService.currentDirection,'down'))
          this.gameStateService.currentDirection = 'down'
        break;
      case 'ArrowLeft':
        if(!this.sharedFunctionsService.isOpposite(this.gameStateService.currentDirection,'left'))
          this.gameStateService.currentDirection = 'left'
        break;
      case 'ArrowRight':
        if(!this.sharedFunctionsService.isOpposite(this.gameStateService.currentDirection,'right'))
          this.gameStateService.currentDirection = 'right'
        break;
    }
  }

  constructor(
    public gameStateService: GameStateService,
    public sharedFunctionsService: SharedFunctionsService,
  ) {
  }

  refreshPage(){
    localStorage.removeItem('snake-v2-data')
    window.location.reload()
  }

  ngOnInit() {
    if(this.type !== 'current'){
      return;
    }
  }
}
