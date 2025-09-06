import { Component } from '@angular/core';
import {GameStateService} from "../../shared-state/game-state.service";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule, ReactiveFormsModule
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {

  constructor(
    public gameState: GameStateService
  ) {
  }


}
