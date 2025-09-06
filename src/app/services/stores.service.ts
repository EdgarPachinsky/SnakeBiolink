import { Injectable } from '@angular/core';
import {IStore} from "../interfaces/stores";

@Injectable({
  providedIn: 'root'
})
export class StoresService {

  public STORES: IStore[] = []
  public BOARD_WIDTH:number = 0;
  public BOARD_HEIGHT:number = 0;

  constructor() {}

  initializeStores(
    width:number,
    height:number
  ){
    this.BOARD_HEIGHT = height;
    this.BOARD_WIDTH = width;

    this.STORES = [
      {
        type: 'power-up',
        coordinates: [
          {
            x: 0,
            y: 11,
          },
          {
            x: 0,
            y: 12,
          },
          {
            x: 1,
            y: 11,
          },
          {
            x: 1,
            y: 12,
          },
        ]
      },
      {
        type: 'next-level',
        coordinates: [
          {
            x: this.BOARD_WIDTH-2,
            y: this.BOARD_HEIGHT-2,
          },
          {
            x: this.BOARD_WIDTH-2,
            y: this.BOARD_HEIGHT-1,
          },
          {
            x: this.BOARD_WIDTH-1,
            y: this.BOARD_HEIGHT-2,
          },
          {
            x: this.BOARD_WIDTH-1,
            y: this.BOARD_HEIGHT-1,
          },
        ]
      },
      {
        type: 'prev-level',
        coordinates: [
          {
            x: 1,
            y: this.BOARD_HEIGHT-1,
          },
          {
            x: 1,
            y: this.BOARD_HEIGHT-2,
          },
          {
            x: 0,
            y: this.BOARD_HEIGHT-1,
          },
          {
            x: 0,
            y: this.BOARD_HEIGHT-2,
          },
        ]
      }
    ]
  }
}
