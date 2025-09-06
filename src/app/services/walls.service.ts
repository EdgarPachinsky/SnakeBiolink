import { Injectable } from '@angular/core';
import {IWall, IWallPoints} from "../interfaces/wall";
import {SharedFunctionsService} from "./shared-functions.service";
import {IAllBusyCoordinatesList} from "../interfaces/shared";

@Injectable({
  providedIn: 'root'
})
export class WallsService extends SharedFunctionsService{

  public baseClusters: number = 3; // starting clusters
  public baseMinLength: number = 4; // starting min wall length
  public baseMaxLength: number = 8; // starting max wall length

  constructor(
  ) {
    super();
  }

  getWallParams(level: number) {
    const wallClusters = this.baseClusters + Math.floor(level / 2); // every 2 levels adds 1 cluster
    const minLength = this.baseMinLength + Math.floor(level / 3); // every 3 levels adds 1 to min length
    const maxLength = this.baseMaxLength + Math.floor(level / 2); // every 2 levels adds 1 to max length

    return {
      wallClusters,
      minLength,
      maxLength
    };
  }

  generateClusteredWalls(
    width: number,
    height: number,
    wallClusters: number,
    minLength: number,
    maxLength: number,
    allBusyCoordinatesList:IAllBusyCoordinatesList
  ):IWall[]{

    let walls: IWall[] = [];
    let wallPoints: IWallPoints[] = [];

    const addWall = (x: number, y: number) => {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        wallPoints.push({
          x, y
        });
      }
    };

    for (let i = 0; i < wallClusters; i++) {
      wallPoints = [];

      let x = this.randomIntExcept(0, width, [
        ...allBusyCoordinatesList.xList,
      ]);
      let y = this.randomIntExcept(0, height, [
        ...allBusyCoordinatesList.yList,
      ]);

      const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
      const direction = Math.floor(Math.random() * 4); // 0=up,1=right,2=down,3=left

      for (let j = 0; j < length; j++) {
        addWall(x, y);
        if (direction === 0) y--;      // up
        if (direction === 1) x++;      // right
        if (direction === 2) y++;      // down
        if (direction === 3) x--;      // left
      }

      walls.push({
        points: wallPoints
      })
    }

    return walls
  }
}
