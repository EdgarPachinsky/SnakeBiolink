export interface IStore {
  type: 'power-up' | 'skins' | 'next-level' | 'prev-level'
  coordinates: IStoreCoordinates[]
}

export interface IStoreCoordinates {
  x: number
  y: number
}
