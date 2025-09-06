import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedFunctionsService {

  constructor() { }

  randomIntExcept(min: number, max: number, except: number[]): number {
    const excluded = new Set(except);

    if (excluded.size >= (max - min + 1)) {
      return 0
    }

    let num: number;
    do {
      num = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (excluded.has(num));

    return num;
  }

  isOpposite(currentDirection: 'unset' | 'up' | 'down' | 'left' | 'right', dirToCheck: 'down' | 'up' | 'right' | 'left'): boolean {
    return (
      (currentDirection === "up" && dirToCheck === "down") ||
      (currentDirection === "down" && dirToCheck === "up") ||
      (currentDirection === "left" && dirToCheck === "right") ||
      (currentDirection === "right" && dirToCheck === "left")
    );
  }
}
