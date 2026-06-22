export type IUser = {
    name:string
    password: string
}

export interface User {
  x: number;
  y: number;
  userId: string;
}

export type FurnitureType = 'rect-table' | 'round-table' | 'solo-desk';


export interface chairCordinates {
    x: number,
    y: number
}

export interface Furniture {
    id: string;
    type: FurnitureType;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    chairs: { dx: number; dy: number; chairId: number; rotate: number }[];
    room:{rotate: number, minX:number, maxX: number, minY: number, maxY: number, name: string }
}

export interface Room {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  name: string;
}
 
export interface Chair {
  dx: number;
  dy: number;
  rotate: number;
  chairId: number;
}
export interface DynamicComponentProps {
  text: string;
}

