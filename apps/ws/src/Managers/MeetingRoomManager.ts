import type { User } from "./User.js";
import { MeetingRoom } from "./MeetingRoom.js";
import type { MessageSchema } from "src/types.js";

export class MeetingRoomManager {
    meetingRooms: Map<string, Map<string, MeetingRoom> > = new Map()
    occupiedChair: {x:number, y: number}[];
    static instance: MeetingRoomManager
    constructor() {   
        this.meetingRooms = new Map();
        this.occupiedChair = []
    }

    static getInstance() {
        if (!this.instance) {
            console.log("creating meetingroommanager")
            this.instance = new MeetingRoomManager()
        }
        return this.instance
    }

    public getRoom(roomId: string){
        const room = this.meetingRooms.get(roomId)
        if(!room) return;
        return room;
    }

    public createRoom(spaceId: string, roomId: string){
        if(!this.meetingRooms.has(spaceId)){
            this.meetingRooms.set(spaceId, new Map())
        }
        const room = new MeetingRoom(roomId)
        this.meetingRooms.get(spaceId)?.set(roomId, room)
        return room;
    }

    public deleteRoom(spaceId: string, roomId: string){
        this.meetingRooms.get(spaceId)?.delete(roomId)
    }

    public addUser(roomId: string, user: User) {

        let room = this.meetingRooms.get(user.spaceId ?? "")?.get(roomId)
        if(!room){
            console.log('room not there')
            room = this.createRoom(user.spaceId ?? "", roomId)
        }
        room?.addUser(user);
        
    }

    public onOffer(targetId: string, roomId: string, sdp: any, user: User) {
        const room = this.meetingRooms.get(user.spaceId ?? "")?.get(roomId);
        if (!room) return;
        room?.onOffer(targetId, sdp, user)
    }

    public onAnswer(targetId: string, roomId: string, sdp: any, user: User) {
        const room = this.meetingRooms.get(user.spaceId ?? "")?.get(roomId)
        if(!room) return;

        room.onAnswer(targetId, sdp, user)
    }

    public onIceCandidate(targetId: string, roomId: string, candidate: any, type: string, user: User) {
        const room = this.meetingRooms.get(user.spaceId ?? "")?.get(roomId);
        if (!room || !user) return;

        room.onIceCandidate(targetId, candidate, type, user)

    }

    public handleUserLeftMeeting(roomId: string, user: User) {
        console.log("handling user left meeting")
        const room = this.meetingRooms.get(user.spaceId ?? "")?.get(roomId);
        if (!room) return;
        room.removeUser(user);
        
    }

    public addOccupiedChair(x: number, y: number){
        this.occupiedChair.push({x,y})
    }

    public removeOccupiedChair(x: number, y: number){
        this.occupiedChair = this.occupiedChair.filter( item => !(item.x === x && item.y === y))
    }

    public checkOccupiedChair(x: number, y: number) {
        let res = false;
        this.occupiedChair.forEach(i => {
            if(i.x == x && i.y == y){
                res = true;
            } 
        })
        return res;
    }
        //todo : add message schena and test the chat 
    public addMessage(user: User, payload: any){
        const room = this.meetingRooms.get(user.spaceId)?.get(payload.roomId)

        if(!room) return;
        const message: MessageSchema = {
            id: Math.random()+"hello",
            groupId: "",
            senderId: payload.userId,
            message: payload.message,
            createdAt: payload.createdat,
            edited: false,
            deleted: false,
        }
        room.addMessage(message,user)
        
    }
}