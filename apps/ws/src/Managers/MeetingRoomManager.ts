import type { OutgoingMessage } from "src/types.js";
import type { User } from "./User.js";

export class MeetingRoomManager {
    meetingRoom: Map<string, User[]> = new Map()
    static instance: MeetingRoomManager

    constructor() {
        this.meetingRoom = new Map()
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new MeetingRoomManager()
        }
        return this.instance
    }

    public addUser(meetingId: string, user: User) {
        if (this.meetingRoom.get(meetingId)?.find( u => u.id === user.id)) return

        this.meetingRoom.set(meetingId, [...(this.meetingRoom.get(meetingId) ?? []), user])
        console.log("length",typeof this.meetingRoom.get(meetingId)?.length)
        const length = this.meetingRoom.get(meetingId)?.length!
        console.log("length",length)
        if(length < 2) return;
    
        this.broadcast({ type: "send-offer", payload: { meetingId: meetingId } }, user, meetingId);
    }
    
    public onOffer() {

    }

    public broadcast(message: OutgoingMessage, user: User, meetingId: string) {
        console.log("inside the broadcast",message.type)
        if (!this.meetingRoom.get(meetingId)?.find(u => u === user)) return
        console.log("user found")
        this.meetingRoom.get(meetingId)?.forEach((e) => {
            if (e.id !== user.id) {
                e.ws.send(
                    JSON.stringify(message)
                )
            }
        })
    }

    public removeUser(meetingId: string, userId: string) {
        if (!this.meetingRoom.has(meetingId)) return

        this.meetingRoom.set(meetingId, this.meetingRoom.get(meetingId)?.filter(u => u.id !== userId)!)
    }

}