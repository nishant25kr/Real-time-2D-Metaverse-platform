import type { OutgoingMessage } from "src/types.js";
import type { User } from "./User.js";
import { string } from "zod";


export class MeetingRoom{
    public id: string;
    private users : User[];
    static instance: MeetingRoom

    constructor(id: string){
        this.id = id;
        this.users = [];
    }
    
    public addUser(meetingId: string,user: User){
        
        if(this.users.find( u => u.id === user.id)) return;
        this.users.push(user)
        const length = this.users.length
        if(length < 2) return;

        user.ws.send(
            JSON.stringify({
                type: "init-call",
                payload: {
                    meetingId: meetingId,
                    id: Array.from(new Set(this.users.map(u => u.userId))) || [],
                }
            })
        )
        
    }

    public removeUser(user:User){
        this.users = this.users.filter(u => u.id === user.id)
    }

    public broadcast(message: OutgoingMessage, user: User, meetingId: string){
        if(!this.users.find(u => u.id === user.id)) return;
        this.users.forEach((u)=>{
            if(u.id !== user.id){
                u.ws.send(
                    JSON.stringify(message)
                )
            }
        })
    }

}