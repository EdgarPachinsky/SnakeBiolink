import { Injectable } from '@angular/core';
import {IGameObjectProperties, IGameObjects} from "../shared-state/game-state.service";
import {ISnake} from "../interfaces/snake";

export interface ISavedGameData {
  snake: ISnake[],
  levels: IGameObjectProperties[],
  currentLevel:number,
  gameObjects: IGameObjects,
  lastDirection: 'unset' | 'up' | 'down' | 'left' | 'right'
}

@Injectable({
  providedIn: 'root'
})
export class SaveServiceService {

  constructor() { }

  save(
    config: ISavedGameData
  ){
    localStorage.setItem('snake-v2-data', JSON.stringify(config));
  }

  load(){
    let data = localStorage.getItem('snake-v2-data')
    return (data && (JSON.parse(data) as ISavedGameData)) || null;
  }
}
