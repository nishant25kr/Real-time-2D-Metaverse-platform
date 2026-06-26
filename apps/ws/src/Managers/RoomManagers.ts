import type { OutgoingMessage, UserAvatar } from "../types.js";
import type { User } from "./User.js";

export class RoomManager {
    rooms: Map<string, User[]> = new Map()
    static instance: RoomManager
    
    constructor() {
        this.rooms = new Map()
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager()
        }
        return this.instance;   
    }

    public addUser(spaceId: string, user: User) {
        if (!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId, [user])
            return;
        }
        this.rooms.set(spaceId, [...(this.rooms.get(spaceId) ?? []), user])
    }

    public broadcast(message: OutgoingMessage, user: User, roomId: string) {
        if (!this.rooms.has(roomId)) {
            return;
        }
        this.rooms.get(roomId)?.forEach((x) => {
            if (x.id !== user.id) {
                if (x.ws.readyState === 1) {
                    x.ws.send(JSON.stringify(message));
                }
            }
        })
    }
    public removeUser(spaceId: string, userId: string) {
        if (!this.rooms.has(spaceId)) {
            return;
        }
        this.rooms.set(spaceId, this.rooms.get(spaceId)?.filter(u => u.userId !== userId)!)
    }

    public addUserToMeetingRoom(roomId: string, user: User){
        const room = this.rooms.get(user.spaceId!)
        if(!room) return;
        if(!room.find(u => u.id === user.id)) return;
    }

    public getAllUsersInRoom(spaceId : string ):{id: string, x: number, y: number, avatar: UserAvatar, username: string}[]{
        const usersInRoom = this.rooms.get(spaceId)
        if(!usersInRoom) return [];

        return usersInRoom.map(u => ({id: u.userId!, x: u.x, y: u.y, avatar: u.avatar, username: u.username}))
    }
}