import type { OutgoingMessage } from "src/types.js";
import type { User } from "./User.js";

export class MeetingRoomManager{
    meetingRoom : Map<string, User[]> = new Map()
    static instance: MeetingRoomManager
    
    constructor(){
        this.meetingRoom = new Map()
    }

    static getInstance(){
        if(!this.instance){
            this.instance = new MeetingRoomManager()
        }
        return this.instance
    }

    

    public addUser(meetingId : string, user : User){
        if(this.meetingRoom.has(user.id)) return

        this.meetingRoom.set(meetingId,[...(this.meetingRoom.get(meetingId) ?? []), user])

this.broadcast({type:"send-offer",payload:{meetingId: meetingId }},user,meetingId);
    }

    public onOffer(){
        
    }



    public broadcast(message: OutgoingMessage, user: User, meetingId: string){
        if(!this.meetingRoom.get(meetingId)?.find(u => u === user)) return 

        this.meetingRoom.get(meetingId)?.forEach((e)=>{
            if(e.id !== user.id){
                e.ws.send(
                    JSON.stringify(message)
                )
            }
        })
    }

    public removeUser(meetingId: string , userId: string){
        if(!this.meetingRoom.has(meetingId)) return

        this.meetingRoom.set(meetingId,this.meetingRoom.get(meetingId)?.filter(u => u.id !== userId)!)
    }

}