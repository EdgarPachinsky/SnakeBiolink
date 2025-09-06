import { Injectable } from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {SaveServiceService} from "../save-service/save-service.service";
import {ISnake} from "../interfaces/snake";
import {IFood} from "../interfaces/food";
import {IWall, IWallPoints} from "../interfaces/wall";
import {IStore} from "../interfaces/stores";
import {StoresService} from "../services/stores.service";
import {SharedFunctionsService} from "../services/shared-functions.service";
import {WallsService} from "../services/walls.service";

export interface IGameObjectProperties {
  stores: IStore[],
  walls: IWall[],
  foods: IFood[]
}
export interface IGameObjects {
  prev: IGameObjectProperties
  current: IGameObjectProperties
  next: IGameObjectProperties
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  public currentLevel:number = 1;

  public SNAKE_LIVES = 4;
  public BOARD_WIDTH = 50;
  public BOARD_HEIGHT = 80;
  public GAME_SPEED = 1;

  public boardWidthControl = new FormControl(this.BOARD_WIDTH, [Validators.required]);
  public boardHeightControl = new FormControl(this.BOARD_HEIGHT, [Validators.required]);
  public gameSpeedControl = new FormControl(this.GAME_SPEED, [Validators.required]);

  public currentDirection: 'unset' | 'up' | 'down' | 'left' | 'right' = 'unset'
  public animationId: number | null = null;

  public gameObjects:IGameObjects = {} as IGameObjects
  public levels: IGameObjectProperties[] = [];

  public snake: ISnake[] = []

  public disablePortals: boolean = false;

  constructor(
    public saveServiceService: SaveServiceService,
    public storesService: StoresService,
    public sharedFunctionsService: SharedFunctionsService,
    public wallsService: WallsService,
  ) {
    storesService.initializeStores(this.BOARD_WIDTH, this.BOARD_HEIGHT);

    const initialData = saveServiceService.load();

    if(initialData){
      this.gameObjects = initialData.gameObjects;
      this.currentLevel = initialData.currentLevel;
      this.levels = initialData.levels;
      this.snake = initialData.snake;
      this.currentDirection = initialData.lastDirection
    }
    else{
      this.currentLevel = 1;
      this.levels = [];
      this.snake = [
        {
          x: 10,
          y: 10,
          type: 'head'
        },
      ]

      const prevLevel = this.generateGameProperties(false, false, false, 'prev');
      const currentLevel = this.generateGameProperties(true, true, true, 'current');
      const nextLevel = this.generateGameProperties(true, true, false, 'next');

      this.gameObjects = {
        'prev': prevLevel,
        'current': currentLevel,
        'next': nextLevel,
      }

      this.levels = [
        prevLevel,
        currentLevel,
        nextLevel,
      ]

      this.saveServiceService.save({
        snake: this.snake,
        levels: this.levels,
        currentLevel: this.currentLevel,
        gameObjects: this.gameObjects,
        lastDirection: this.currentDirection
      })
    }
  }

  public generateGameProperties(
    stores: boolean = true,
    walls: boolean = true,
    foods: boolean = true,
    boardType: 'prev' | 'current' | 'next'
  ): IGameObjectProperties{
    const { wallClusters, minLength, maxLength } = this.wallsService.getWallParams(this.currentLevel);

    return {
      stores: stores ? this.storesService.STORES : [],
      walls: walls ? this.wallsService.generateClusteredWalls(this.BOARD_WIDTH, this.BOARD_HEIGHT, wallClusters, minLength, maxLength, this.allBusyCoordinatesList(boardType)): [],
      foods: foods ? [this.getNewFoodPoint(boardType)]: []
    }
  }

  startAnimation(updateFn: (deltaTime: number) => void) {
    let lastTime = performance.now();
    let accumulator = 0;
    const frameDelay = 100; // milliseconds between snake moves

    const loop = (now: number) => {
      const deltaTime = now - lastTime;
      lastTime = now;
      accumulator += deltaTime;

      if (accumulator >= frameDelay) {
        updateFn(deltaTime / 1000); // Pass seconds if needed
        accumulator = 0; // Reset timer
      }

      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  stopAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  get newHead(){
    let newHead: ISnake = {
      x: this.snake[0].x,
      y: this.snake[0].y,
      type: 'head',
    }
    switch (this.currentDirection) {
      case "up":
        newHead.y--;
        if(newHead.y < 0){
          newHead.y = this.boardHeightControl.value! - 1;
          break;
        }
        break;
      case "down":
        newHead.y++;
        if(newHead.y === this.boardHeightControl?.value!){
          newHead.y = 0;
          break;
        }
        break;
      case "left":
        newHead.x--;
        if(newHead.x < 0){
          newHead.x = this.boardWidthControl.value! - 1;
          break;
        }
        break;
      case "right":
        newHead.x++;
        if(newHead.x === this.boardWidthControl.value!){
          newHead.x = 0
          break;
        }
        break;
    }

    return newHead;
  }

  startGame(){
    this.startAnimation((dt) => {

      const newHead = {...this.newHead}

      this.snake[0].type = 'body';
      this.snake.unshift(newHead)

      const ateFood = this.foodCheck(newHead);
      this.selfBiteCheck(newHead);
      this.checkWallHit(newHead);
      this.checkNextLevelGo(newHead, 'next-level');
      this.checkNextLevelGo(newHead, 'prev-level');

      if(!ateFood && this.snake.length !== 1){
        this.snake.pop()
      }

      this.saveServiceService.save({
        snake: this.snake,
        levels: this.levels,
        currentLevel: this.currentLevel,
        gameObjects: this.gameObjects,
        lastDirection: this.currentDirection
      })
    });
  }

  checkNextLevelGo(head: ISnake, direction: 'next-level' | 'prev-level'){
    if(this.disablePortals){
      return
    }

    if(this.isStore(
      head.x, head.y, direction
    )){
      this.disablePortals = true;
      setTimeout(() => {
        this.disablePortals = false;
      },3000)

      const currentLevelMap = this.levels[this.currentLevel];
      this.currentLevel = this.currentLevel + (direction === 'next-level' ? 1: -1);
      const nextLevelMap = this.levels[this.currentLevel];

      if(direction === 'prev-level'){
        const prePrev = this.levels[this.currentLevel - 1];
        this.gameObjects.prev = {
          ...prePrev,
          foods: []
        }
        this.gameObjects.current = {
          walls: nextLevelMap.walls,
          stores: this.storesService.STORES,
          foods: [this.getNewFoodPoint('prev')]
        }
        this.gameObjects.next = {
          ...currentLevelMap,
          foods:[]
        }
      }else{
        const nextLevelMap = {
          ...this.gameObjects.next
        }
        const currentLevelMap = {
          ...this.gameObjects.current
        }

        // current becomes previous
        this.gameObjects.prev = {
          ...currentLevelMap,
          foods: []
        }
        // setting new current
        this.gameObjects.current = {
          walls: nextLevelMap.walls,
          stores: this.storesService.STORES,
          foods: [this.getNewFoodPoint('next')]
        }
        if(this.currentLevel + 1 < this.levels.length - 1){
          this.gameObjects.next = {
            ...this.levels[this.currentLevel + 1]
          }
        }else{
          const newNext = this.generateGameProperties(true, true, false, 'next');
          // generate new next
          this.gameObjects.next = {
            ...newNext,
          }
          this.levels.push(newNext)
        }
      }
    }
  }

  checkWallHit(head: ISnake){
    if(this.isWall(head.x, head.y)){
      this.snake.splice(1);
      this.decreaseLive();
      // this.setOppositeDirection();
    }
  }

  decreaseLive(){
    this.SNAKE_LIVES = --this.SNAKE_LIVES;
    // if(this.SNAKE_LIVES === 0){
    //   this.stopAnimation();
    // }
  }

  foodCheck(head: ISnake): boolean{
    if(
      this.isFood(head.x , head.y)
    ){
      let foodIndex = this.gameObjects.current.foods.findIndex((el) => el.x === head.x && el.y == head.y);
      this.gameObjects.current.foods.splice(foodIndex, 1)
      this.gameObjects.current.foods.push(
        this.getNewFoodPoint('current')
      )
      return true
    }

    return false
  }

  selfBiteCheck(head: ISnake){
    if(this.isSnakePart(head.x, head.y, 'body')){

      let index = this.snake.findIndex((el) => el.x === head.x && el.y === head.y && el.type === 'body');
      if(index !== -1){
        this.snake.splice(index);
      }
    }
  }

  getSnakeLivesArray(): number[] {
    return Array.from({ length: this.SNAKE_LIVES }, (_, i) => i);
  }

  getBoardWidthArray(): number[] {
    return Array.from({ length: this.boardWidthControl?.value || 0 }, (_, i) => i);
  }

  getBoardHeightArray(): number[] {
    return Array.from({ length: this.boardHeightControl?.value || 0 }, (_, i) => i);
  }

  isSnakePart(x:number,y:number, type:'head' | 'body', boardType: 'prev' | 'current' | 'next' = 'current'){
    return boardType === 'current' && this.snake.find((el) => el.x === x && el.y === y && el.type === type);
  }
  isFood(x:number, y:number, boardType: 'prev' | 'current' | 'next' = 'current') {
    return !!this.gameObjects[boardType].foods.find(el => el.x === x && el.y === y);
  }
  isStore(x:number, y:number, type: 'power-up' | 'skin' | 'next-level' | 'prev-level', boardType: 'prev' | 'current' | 'next' = 'current') {
    if(this.currentLevel === 1 && type === 'prev-level' && boardType === 'current'){
      return false
    }

    return !!this.gameObjects[boardType].stores.find(el => {
      return el.type === type && el.coordinates.find((c) => c.x === x && c.y === y);
    });
  }
  isWall(x:number, y:number, boardType: 'prev' | 'current' | 'next' = 'current') {
    return !!this.gameObjects[boardType].walls.find(el => {
      return  el.points.find((p) => p.x === x && p.y === y);
    });
  }

  get currentSnakeCoordinates(){
    return {
      xList: (this.snake || []).map((el) => el.x),
      yList: (this.snake || []).map((el) => el.y),
    }
  }

  doorCoordinates(boardType: 'prev' | 'current' | 'next'){
    return {
      xList: (this.gameObjects[boardType]?.stores || []).map((el) => el.coordinates.map((c) => c.x)).flat(),
      yList: (this.gameObjects[boardType]?.stores || []).map((el) => el.coordinates.map((c) => c.y)).flat(),
    }
  }

  wallCoordinates(boardType: 'prev' | 'current' | 'next'){
    return {
      xList: (this.gameObjects[boardType]?.walls || []).map((el) => el.points.map((p) => p.x)).flat(),
      yList: (this.gameObjects[boardType]?.walls || []).map((el) => el.points.map((p) => p.y)).flat(),
    }
  }

  allBusyCoordinatesList(boardType: 'prev' | 'current' | 'next'){
    return {
      xList: Array.from(new Set([
        ...this.wallCoordinates(boardType).xList,
        ...this.currentSnakeCoordinates.xList,
        ...this.doorCoordinates(boardType).xList,
      ])),
      yList: Array.from(new Set([
        ...this.doorCoordinates(boardType).yList,
        ...this.wallCoordinates(boardType).yList,
        ...this.currentSnakeCoordinates.yList,
      ])),
    };
  }

  getNewFoodPoint(boardType: 'prev' | 'current' | 'next'): IFood{
    return  {
      x: this.sharedFunctionsService.randomIntExcept(0, this.BOARD_WIDTH-1, [
        ...this.allBusyCoordinatesList(boardType).xList,
      ]),
      y: this.sharedFunctionsService.randomIntExcept(0, this.BOARD_HEIGHT-1, [
        ...this.allBusyCoordinatesList(boardType).yList,
      ]),
    }
  }
}
