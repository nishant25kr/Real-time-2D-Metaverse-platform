import type { OutgoingMessage } from "../types.js";
import type { User } from "./User.js";

export class RoomManager{
    rooms: Map<string, User[]> = new Map();
    static instance : RoomManager
    constructor(){
        this.rooms = new Map()
    }

    static getInstance(){
        if(this.instance){
            this.instance = new RoomManager()
        }
        return this.instance;
    }

    public addUser(spaceId: string, user: User){
        if(!this.rooms.has(spaceId)){
            this.rooms.set(spaceId, [user])
        }
        this.rooms.set(spaceId ,[...(this.rooms.get(spaceId) ?? []), user])
    }

    public broadcast(message: OutgoingMessage, user :User , roomId:string){
        if(!this.rooms.has(roomId)){
            return ;
        }
        this.rooms.get(roomId)?.forEach((x) => {
            if(x != user){
                x.ws.send(JSON.stringify(message))
            }
        })
    }

    public removeUser(spaceId: string, userId: string){
        if(!this.rooms.has(spaceId)){
            return
        }
        this.rooms.set(spaceId, this.rooms.get(spaceId)?.filter( u => u.id !== userId)!)
        
    }
}