import type WebSocket from "ws";
import { RoomManager } from "./RoomManagers.js";
import jwt from 'jsonwebtoken';
import client from "@repo/db"
import { MeetingRoomManager } from "./MeetingRoomManager.js";
import type { UserAvatar } from "src/types.js";
const JWT_PASSWORD = process.env.JWT_PASSWORD || "password"

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
    public spaceId!: string;
    public x: number;
    public y: number;
    public userId!: string;
    public avatar!: UserAvatar;
    public username!: string;
    constructor(public ws: WebSocket) {
        this.id = getRandomId(10);
        this.x = 25;
        this.y = 25;
        this.initHandler();
    }

    private canSend() {
        return this.ws.readyState === 1;
    }

    private safeSend(message: unknown) {
        if (!this.canSend()) return;
        try {
            this.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error('Failed to send WebSocket message', error);
        }
    }

    initHandler() {
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(data.toString());
            switch (parsedData.type) {
                case "join":
                    console.log("inside join")
                    const spaceID = parsedData.payload.spaceId
                    const token = parsedData.payload.token
                    const passcode = parsedData.payload.passcode
                    let user;
                    try {
                        user = jwt.verify(token, JWT_PASSWORD);
                    } catch (err) {
                        console.log(err)
                        this.ws.close();
                        return;
                    }
                    const id = this.userId = (user as jwt.JwtPayload).userId;
                    if (!id) {
                        this.ws.close();
                        return;
                    }
                    const userdetails = await client.user.findUnique({
                        where: {
                            id: id
                        },
                        select: {
                            password: false,
                            username: true,
                            avatarId: true
                        }
                    })
                    if (!userdetails) {
                        this.ws.close();
                        return;
                    }
                    const avatar = await client.avatar.findUnique({
                        where: {
                            id: userdetails.avatarId!
                        }
                    })
                    this.avatar = avatar as UserAvatar;
                    this.username = userdetails.username!;
                    if (!avatar) {
                        this.ws.close();
                        return;
                    }
                    const space = await client.space.findUnique({
                        where: {
                            id: spaceID,
                            passcode: passcode
                        }
                    })
                    if (!space) {
                        console.log("space not found")
                        this.ws.close();
                        return;
                    }
                    this.spaceId = spaceID;
                    RoomManager.getInstance().addUser(spaceID, this)
                    const usersInroom = RoomManager.getInstance().rooms.get(spaceID)?.filter(u => u.id !== this.id).map((u) => ({ id: u.userId, x: u.x, y: u.y, avatar: u.avatar, username: u.username })) ?? []
                    this.safeSend({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y
                            },
                            users: usersInroom,
                            yourId: this.userId,
                            avatar: avatar,
                            username: userdetails.username
                        }
                    })
                    RoomManager.getInstance().broadcast(
                        {
                            type: "user-joined",
                            payload: {
                                id: this.userId,
                                x: this.x,
                                y: this.y,
                                username: this.username,
                                avatar: this.avatar
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
                    const lastx = this.x;
                    const lasty = this.y;
                    if ((Xdisplacement <= 1 && Ydisplacement <= 1) && (Xdisplacement + Ydisplacement > 0)) {
                        const res = MeetingRoomManager.getInstance().checkOccupiedChair(moveX, moveY)
                        console.log("res", res)
                        if (res) {
                            this.safeSend({
                                type: "movement-rejected",
                                payload: {
                                    x: this.x,
                                    y: this.y
                                }
                            });
                            return;
                        }
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

                        if (parsedData.payload.isSitting) {
                            console.log("Adding user to meeting room")
                            MeetingRoomManager.getInstance().addUser(parsedData.payload.roomId, this)
                            MeetingRoomManager.getInstance().addOccupiedChair(moveX, moveY)
                        } else {
                            MeetingRoomManager.getInstance().handleUserLeftMeeting(parsedData.payload.roomId, this)
                            MeetingRoomManager.getInstance().removeOccupiedChair(lastx, lasty)
                        }
                    }
                    else {
                        this.safeSend({
                            type: "movement-rejected",
                            payload: {
                                x: this.x,
                                y: this.y
                            }
                        });
                    }
                    break;

                case "add-ice-candidate":
                    // console.log("PARSED DATA", parsedData)
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
                    MeetingRoomManager.getInstance().onAnswer(parsedData.payload.targetId, parsedData.payload.meetingId, parsedData.payload.sdp, this)
                    break;

                case "leave":
                    // Clean up meeting rooms the user may be in
                    if (this.spaceId) {
                        const spaceRooms = MeetingRoomManager.getInstance().meetingRooms.get(this.spaceId);
                        if (spaceRooms) {
                            spaceRooms.forEach((room) => {
                                room.removeUser(this);
                            });
                        }
                        // Remove occupied chair at user's current position
                        MeetingRoomManager.getInstance().removeOccupiedChair(this.x, this.y);
                    }
                    this.destroy();
                    this.ws.close();
                    break;

                case "user-left":
                    this.destroy();
                    break;
            }
        });
    }

    destroy() {
        if (this.spaceId && this.userId) {
            RoomManager.getInstance().broadcast(
                {
                    type: "user-left",
                    payload: {
                        id: this.userId,
                    }
                },
                this,
                this.spaceId
            );
            RoomManager.getInstance().removeUser(this.spaceId, this.userId);
        }
    }

}