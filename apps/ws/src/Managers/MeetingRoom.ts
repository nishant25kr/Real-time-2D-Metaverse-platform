import type WebSocket from "ws";
import type { MessageSchema, OutgoingMessage } from "src/types.js";
import type { User } from "./User.js";

export class MeetingRoom{
    public roomId: string;
    private users : User[];
    public messages: MessageSchema[]
    constructor(roomId: string){
        this.roomId = roomId;
        this.users = [];
        this.messages = [];

    }
    
    private canSend(ws: WebSocket) {
        return ws.readyState === 1;
    }

    private safeSend(ws: WebSocket, message: unknown) {
        if (!this.canSend(ws)) return;
        try {
            ws.send(JSON.stringify(message));
        } catch (error) {
            console.error('Failed to send meeting room WebSocket message', error);
        }
    }

    public addUser(user: User){
        if(this.users.find( u => u.userId === user.userId)) return;
        this.users.push(user)
        const length = this.users.length
        if(length < 2) return;
        console.log("broadcasting init call")
        this.safeSend(user.ws, {
            type: "init-call",
            payload: {
                meetingId: this.roomId,
                id: Array.from(new Set(this.users.map(u => u.userId))) || [],
            }
        })
        
    }

    public removeUser(user:User){
        this.users = this.users.filter(u => u.id !== user.id);

        this.users.forEach((u) => {
            this.safeSend(u.ws, {
                type: "user-left-meeting",
                payload: {
                    userId: user.userId
                }
            });
        });
    }

    public broadcast(message: OutgoingMessage, user: User){
        if(!this.users.find(u => u.id === user.id)) return;
        this.users.forEach((u)=>{
                this.safeSend(u.ws, {
                    type: "recieve-message",
                    payload:{
                        message: message
                    }
                });
        })
    }

    public getUserLength(){
        return this.users.length
    }

    public onOffer(targetId: string, sdp: any, user: User){
        this.users.forEach(u => {
            if (u.userId === targetId) {
                this.safeSend(u.ws, {
                    type: "offer",
                    payload: {
                        meetingId: this.roomId,
                        sdp,
                        senderId: user.userId
                    }
                });
            }
        })
    }

    public onAnswer(targetId: string, sdp: any, user: User){
        const targetUser = this.users.find(u => u.userId === targetId);
        if (targetUser) {
            this.safeSend(targetUser.ws, {
                type: "answer",
                payload: {
                    sdp,
                    senderId: user.userId
                }
            });
        }

    }

    public onIceCandidate(targetId: string, candidate: any, type: string, user: User){
        const targetUser = this.users.find(u => u.userId === targetId);
        if (targetUser) {
            this.safeSend(targetUser.ws, {
                type: "add-ice-candidate",
                payload: {
                    candidate,
                    type,
                    senderId: user.userId
                }
            });
        }
    }

    public addMessage(payload: MessageSchema,user: User){
        // const user = this.users.find((u)=> u.id = payload.senderId)
        if(!user) return 
        this.messages.push(payload) 
        this.broadcast(payload, user)
    }

}