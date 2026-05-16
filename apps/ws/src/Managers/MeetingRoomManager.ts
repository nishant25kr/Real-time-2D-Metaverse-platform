import type { OutgoingMessage } from "src/types.js";
import type { User } from "./User.js";
import { MeetingRoom } from "./MeetingRoom.js";

export class MeetingRoomManager {
    meetingRooms: Map<string, MeetingRoom> = new Map()
    static instance: MeetingRoomManager

    constructor() {
        this.meetingRooms = new Map()
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new MeetingRoomManager()
        }
        return this.instance
    }

    public getRoom(roomId: string){
        const room = this.meetingRooms.get(roomId)
        if(!room) return;
        return room;
    }

    public createRoom(roomId: string){
        const room = new MeetingRoom(roomId)
        this.meetingRooms.set(roomId, room)
        return room;
    }

    public deleteRoom(roomId: string){
        this.meetingRooms.delete(roomId)

    }

    public addUser(roomId: string, user: User) {
        const room = this.meetingRooms.get(roomId);
        if(!room){
            const room = this.createRoom(roomId)
            room?.addUser(user);    
            return;
        }else{
            room?.addUser(user);
        }
    }

    public broadcast(message: OutgoingMessage, user: User, meetingId: string) {
        // if (!this.meetingRoom.get(meetingId)?.find(u => u === user)) return
        // this.meetingRoom.get(meetingId)?.forEach((e) => {
        //     if (e.id !== user.id) {
        //         e.ws.send(
        //             JSON.stringify(message)
        //         )
        //     }
        // })
        


    }

    public onOffer(targetId: string, roomId: string, sdp: any, user: User) {
        const room = this.meetingRooms.get(roomId);
        if (!room) return;
        room?.onOffer(targetId, sdp, user)
    }

    public onAnswer(targetId: string, roomId: string, sdp: any, user: User) {
        const room = this.meetingRooms.get(roomId)
        if(!room) return;

        room.onAnswer(targetId, sdp, user)
    }

    public onIceCandidate(targetId: string, roomId: string, candidate: any, type: string, user: User) {
    const room = this.meetingRooms.get(roomId);
        if (!room || !user) return;

        room.onIceCandidate(targetId, candidate,type,user)

    }

    public handleUserLeftMeeting(roomId: string, user: User) {
        const room = this.getRoom(roomId)
        room?.removeUser(user)

        //TODO: check the users length if it is 0 delete the class and from the map also
        // const roomlength = room?.getUserLength()

        // if(roomlength == 0) this.deleteRoom(roomId)
        
    }

}