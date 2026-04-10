export type IUser = {
    name:string
    password: string
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
}

export interface DynamicComponentProps {
  text: string;
}

interface User{
  userId:string,
  // message: string,
  x:number,
  y:number
}

interface spawn {
x: number,
  y: number,
}

interface Payload {
  spawn:spawn
  id: string,
}

interface IncomingMessage{
  type: string,
  payload: Payload

}



