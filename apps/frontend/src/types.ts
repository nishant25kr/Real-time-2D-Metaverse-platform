export type IUser = {
    name:string
    password: string
}

export interface User {
  x: number;
  y: number;
  userId: string;
  username: string;
  avatar: {
    id: string;
    imageUrl: string;
    name: string;
  }
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

export type MessageSchema = {
  id: string;
  groupId: string;
  senderId: string;
  message: string;
  createdAt: Date;
  edited: boolean;
  deleted: boolean;
};

export type WsMessage =
  | {
      type: 'space-joined';
      payload: {
        spawn: { x: number; y: number };
        yourId: string;
        username: string;
        avatar: { id: string; imageUrl: string; name: string };
        users: { id: string; x: number; y: number; username: string; avatar: { id: string; imageUrl: string; name: string } }[];
      };
    }
  | { type: 'user-joined'; payload: { id: string; x: number; y: number; username: string; avatar: { id: string; imageUrl: string; name: string } } }
  | { type: 'move'; payload: { id: string; x: number; y: number } }
  | { type: 'movement-rejected'; payload: { x: number; y: number } }
  | { type: 'user-left'; payload: { id: string } }
  | { type: 'user-left-meeting'; payload: { userId: string } }
  | { type: 'offer'; payload: Record<string, unknown> }
  | { type: 'answer'; payload: Record<string, unknown> }
  | { type: 'add-ice-candidate'; payload: Record<string, unknown> }
  | { type: 'init-call'; payload: { meetingId: string; id: string[] } }
  | { type: 'recieve-message'; payload: { message: MessageSchema } };
