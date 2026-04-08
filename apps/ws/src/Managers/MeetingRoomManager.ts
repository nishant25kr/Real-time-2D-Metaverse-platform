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
        const roomUsers = this.meetingRoom.get(meetingId) || [];
        // Remove existing session for same userId to prevent ghost sessions
        this.meetingRoom.set(meetingId, roomUsers.filter(u => u.userId !== user.userId));
        
        this.meetingRoom.set(meetingId, [...(this.meetingRoom.get(meetingId) ?? []), user]);
        const length = this.meetingRoom.get(meetingId)?.length!
        if (length < 2) return;

        user.ws.send(
            JSON.stringify({
                type: "init-call",
                payload: {
                    meetingId: meetingId,
                    id: Array.from(new Set(this.meetingRoom.get(meetingId)?.map(u => u.userId))) || [],
                }
            })
        )
    }

    public broadcast(message: OutgoingMessage, user: User, meetingId: string) {
        if (!this.meetingRoom.get(meetingId)?.find(u => u === user)) return
        this.meetingRoom.get(meetingId)?.forEach((e) => {
            if (e.id !== user.id) {
                e.ws.send(
                    JSON.stringify(message)
                )
            }
        })
    }

    public onOffer(targetId: string, meetingId: string, sdp: any, user: User) {
        const room = this.meetingRoom.get(meetingId);
        if (!room) return;

        this.meetingRoom.get(meetingId)?.forEach(u => {
            if (targetId === u.userId) {
                u.ws.send(
                    JSON.stringify({
                        type: "offer",
                        payload: {
                            meetingId: meetingId,
                            sdp,
                            senderId: user.userId
                        }
                    })
                )
            }
        })
    }

    public onAnswer(targetId: string, meetingId: string, sdp: any, user: User) {
        const targetUser = this.meetingRoom.get(meetingId)?.find(u => u.userId === targetId);
        if (targetUser) {
            targetUser.ws.send(JSON.stringify({
                type: "answer",
                payload: {
                    sdp,
                    senderId: user.userId
                }
            }));
        }
    }


    public onIceCandidate(targetId: string, meetingId: string, candidate: any, type: string, user: User) {
        const room = this.meetingRoom.get(meetingId);
        if (!room || !user) return;

        const targetUser = room.find(u => u.userId === targetId);
        if (targetUser) {
            targetUser.ws.send(JSON.stringify({
                type: "add-ice-candidate",
                payload: {
                    candidate,
                    type,
                    senderId: user.userId
                }
            }));
        }
    }

    public removeUser(meetingId: string, userId: string) {
        const room = this.meetingRoom.get(meetingId);
        if (room) {
            this.meetingRoom.set(meetingId, room.filter(u => u.id !== userId));
        }
    }

    public handleUserLeftMeeting(meetingId: string, user: User) {
        this.removeUser(meetingId, user.id);
        
        this.meetingRoom.get(meetingId)?.forEach((u) => {
            u.ws.send(JSON.stringify({
                type: "user-left-meeting",
                payload: {
                    userId: user.userId
                }
            }));
        });
    }

}