import { WebSocket } from "ws";
import { RoomManager } from "./RoomManagers";
import client from "@repo/db"
import * as jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "apps/http/src/config";

function getRandomId( length : number ) {
    const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890qoeruqojdnksncadlfjk;l"
    let result = ""
    for(let i=0; i<length; i++){
        result += character.charAt(Math.floor(Math.random() * character.length))
    }
    return result;
}

export class User{
    public id : string;
    private spaceId : string;
    private x : number;
    private y : number;
    private userId: string
    constructor(private ws: WebSocket){
        this.id = getRandomId(10);
        this.x =0;
        this.y = 0;
    }

    initHandler(){
        this.ws.on("message",async (data)=>{
            const parsedData = JSON.parse(data.toString());
            switch (parsedData.type) {
                case "join":
                    const spaceID = parsedData.payload.spaceId
                    const token = parsedData.payload.token
                    const userId = (jwt.verify(token, JWT_PASSWORD) as jwt.JwtPayload).userId
                    if(!userId){
                        this.ws.close
                        return;
                    }

                    // TODO: space dimentions will be fetched from db

                    this.spaceId = spaceID;
                    RoomManager.getInstance().addUser(spaceID, this)
                    this.x = Math.floor(Math.random() * 20)
                    this.y = Math.floor(Math.random() * 20)
                    this.ws.send(JSON.stringify({
                        type:"space-joined",
                        payload:{
                            spawn:{
                                x: this.x,
                                y: this.y 
                            },
                            users: RoomManager.getInstance().rooms.get(spaceID)?.map( (u) => ({id:u.id})) ?? []
                        }
                    }))

                    RoomManager.getInstance().broadcast(
                        {
                            type:"user-joined",
                            payload:{
                                useId: this.userId,
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
                    const Xdisplacement = Math.abs(this.x - moveX)
                    const Ydisplacement = Math.abs(this.y - moveY)

                    if((Xdisplacement == 1 && Ydisplacement == 1) ||(Xdisplacement == 0 && Ydisplacement == 1) ){
                        this.x = moveX
                        this.y = moveY
                        RoomManager.getInstance().broadcast(
                            {
                                type:"move",
                                payload:{
                                    x: this.x,
                                    y: this.y
                                }
                            },
                            this,
                            this.spaceId
                        )
                        return
                    }
                    else{
                        this.ws.send(JSON.stringify({
                            type:"movement-rejected",
                            payload:{
                                x:this.x,
                                y:this.y
                            }
                        }))
                    }
                
            }
        })
    }

    destroy(){
        this.destroy
    }

    send(){

    }
    

}