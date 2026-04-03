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



