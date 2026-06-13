import type { OutgoingMessage } from "src/types.js";
import type { User } from "./User.js";
import { string } from "zod";

export class MeetingRoom{
    public roomId: string;
    private users : User[];

    constructor(roomId: string){
        this.roomId = roomId;
        this.users = [];
    }
    
    public addUser(user: User){
        if(this.users.find( u => u.id === user.id)) return;
        this.users.push(user)
        const length = this.users.length
        if(length < 2) return;
        console.log("broadcasting init call")
        user.ws.send(
            JSON.stringify({
                type: "init-call",
                payload: {
                    meetingId: this.roomId,
                    id: Array.from(new Set(this.users.map(u => u.userId))) || [],
                }
            })
        )
        
    }

    public removeUser(user:User){
        this.users = this.users.filter(u => u.id !== user.id);

        this.users.forEach((u) => {
            u.ws.send(JSON.stringify({
                type: "user-left-meeting",
                payload: {
                    userId: user.userId
                }
            }));
        });
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

    public getUserLength(){
        return this.users.length
    }

    public onOffer(targetId: string, sdp: any, user: User){
        this.users.forEach(u => {
            if (u.userId === targetId) {
                u.ws.send(
                    JSON.stringify({
                        type: "offer",
                        payload: {
                            meetingId: this.roomId,
                            sdp,
                            senderId: user.userId
                        }
                    })
                )
            }
        })
    }

    public onAnswer(targetId: string, sdp: any, user: User){
        const targetUser = this.users.find(u => u.userId === targetId);
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

    public onIceCandidate(targetId: string, candidate: any, type: string, user: User){
        const targetUser = this.users.find(u => u.userId === targetId);
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

}