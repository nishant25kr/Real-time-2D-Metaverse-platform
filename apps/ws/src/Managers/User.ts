import type WebSocket from "ws";
import { RoomManager } from "./RoomManagers.js";
import jwt from 'jsonwebtoken';
import { JWT_PASSWORD } from "../config.js";
import client from "@repo/db"
import { MeetingRoomManager } from "./MeetingRoomManager.js";

function getRandomId(length: number) {
    const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890qoeruqojdnksncadlfjk;l"
    let result = ""
    for (let i = 0; i < length; i++) {
        result += character.charAt(Math.floor(Math.random() * character.length))
    }
    return result;
}

export class User {
    public id: string;
    private spaceId?: string;
    public x: number;
    public y: number;
    public userId?: string
    constructor(public ws: WebSocket) {
        this.id = getRandomId(10);
        this.x = 0;
        this.y = 0;
        this.initHandler();
    }

    initHandler() {
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(data.toString());
            switch (parsedData.type) {
                case "join":
                    const spaceID = parsedData.payload.spaceId
                    const token = parsedData.payload.token
                    const user = jwt.verify(token, JWT_PASSWORD)
                    const id = this.userId = (user as jwt.JwtPayload).userId;
                    if (!id) {
                        this.ws.close();
                        return;
                    }
                    const space = await client.space.findUnique({
                        where:{
                            id: spaceID
                        }
                    })
                    if (!space) {
                        this.ws.close();
                        return;
                    }
                    this.spaceId = spaceID;
                    RoomManager.getInstance().addUser(spaceID, this)
                    this.x = Number(space?.width!)
                    this.y = Number(space?.height!)
                    const usersInroom = RoomManager.getInstance().rooms.get(spaceID)?.filter(u => u.id !== this.id).map((u) => ({ id: u.userId, x: u.x, y:u.y })) ?? []
                    this.ws.send(JSON.stringify({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y
                            },
                            users: usersInroom,
                            yourId: this.userId
                        }
                    }))
                    RoomManager.getInstance().broadcast(
                        {
                            type: "user-joined",
                            payload: {
                                id: this.userId,
                                x: this.x,
                                y: this.y
                            }
                        },
                        this,
                        spaceID
                    )
                    break;

                case "move":
                    const moveX = parsedData.payload.x;
                    const moveY = parsedData.payload.y;
                    const Xdisplacement = Math.abs(this.x - moveX);
                    const Ydisplacement = Math.abs(this.y - moveY);

                    if ((Xdisplacement <= 1 && Ydisplacement <= 1) && (Xdisplacement + Ydisplacement > 0)) {
                        this.x = moveX;
                        this.y = moveY;
                        RoomManager.getInstance().broadcast(
                            {
                                type: "move",
                                payload: {
                                    x: this.x,
                                    y: this.y,
                                    id: this.userId
                                }
                            },
                            this,
                            this.spaceId!
                        );
                         if(parsedData.payload.isinsideRoom){
                            MeetingRoomManager.getInstance().addUser("meetingRoom1", this)
                        } else {
                            MeetingRoomManager.getInstance().handleUserLeftMeeting("meetingRoom1", this)
                        }
                    }
                    else {
                        this.ws.send(JSON.stringify({
                            type: "movement-rejected",
                            payload: {
                                x: this.x,
                                y: this.y
                            }
                        }));
                    }
                    break;
                    
                case "add-ice-candidate":
                    console.log("PARSED DATA", parsedData)
                    MeetingRoomManager.getInstance().onIceCandidate(
                        parsedData.payload.targetId,
                        parsedData.payload.meetingId,
                        parsedData.payload.candidate,
                        parsedData.payload.type,
                        this
                    )
                    break;

                case "offer":
                    MeetingRoomManager.getInstance().onOffer(
                        parsedData.payload.targetId,
                        parsedData.payload.meetingId,
                        parsedData.payload.sdp,
                        this);
                    break;  

                case "answer":
                    MeetingRoomManager.getInstance().onAnswer(parsedData.payload.targetId,parsedData.payload.meetingId, parsedData.payload.sdp, this)
                break;  
            }
        });
    }

    destroy() {
        RoomManager.getInstance().broadcast(
            {
                type: "user-left",
                payload: {
                    id: this.userId,
                }
            },
            this,
            this.spaceId!
        )
        RoomManager.getInstance().removeUser(this.spaceId!, this.userId!)
        MeetingRoomManager.getInstance().handleUserLeftMeeting("meetingRoom1", this)
    }


}