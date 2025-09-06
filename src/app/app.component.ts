import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SettingsComponent} from "./components/settings/settings.component";
import {LevelComponent} from "./components/level/level.component";
import {MatButton} from "@angular/material/button";
import {GameStateService} from "./shared-state/game-state.service";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SettingsComponent, LevelComponent, MatButton, NgClass],
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    public gameStateService: GameStateService,
  ) {
  }
}
