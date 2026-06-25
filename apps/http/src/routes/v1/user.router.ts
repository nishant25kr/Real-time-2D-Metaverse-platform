import { Router } from "express";
import { CreateAvatarSchema, UpdateMetadataSchema } from "../../types/index.js";
import client from "@repo/db"
import { userMiddleware } from "../../middlewares/user.js";

export const userRouter = Router()

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({ message: "Validation failed" })
    }

    if (!req.userId) {
        return res.status(400).json({ message: "Unauthorized" })
    }

    try {
        const avatar = await client.avatar.findUnique({
            where:{
                id: parsedData.data.avatarId
            }
        })

        if(!avatar){
            return res.status(400).json({
                message: "avatar not available"
            })
        }

        await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: parsedData.data.avatarId
            }
        })

        return res.status(200).json({ message: "Metadata Updated" })
    } catch (error) {
        return res.status(400).json({
            message: "Invalid avatar id"
        });
    }
})

userRouter.get("/metadata/bulk",userMiddleware, async (req, res) => {

    const userIdString = (req.query.ids ?? "[]") as string

    let userIds: string[] = []

    if (!userIdString) {
        return res.status(400).json({
            message: "ids query param required"
        });
    }

    try {
        userIds = JSON.parse(userIdString)
    
    } catch {
        return res.status(400).json({ message: "Invalid ids format" })
    }

    if (!Array.isArray(userIds) || userIds.length == 0 ) {
        return res.status(400).json({ message: "No user ids provided" })
    }

    const metadata = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        },
        select: {
            id: true,
            avatar: true
        }
    })
    console.log("metadata", metadata)       
            

    return res.status(200).json({
        avatars: metadata.map((m: any) => ({
            userId: m.id,
            avatarId: m.avatar?.imageUrl
        }))
    })

})

userRouter.put("/add-avatar", userMiddleware, async (req, res) => {

    const { avatarId } = req.body

    if (!avatarId) {
        return res.status(400).json({
            message: "avatarId is required"
        })
    }

    if (!req.userId) {
        return res.status(400).json({ message: "Unauthorized" })
    }

    try {
        const avatar = await client.avatar.findUnique({
            where:{
                id: avatarId
            }
        })

    if(!avatar){
            return res.status(400).json({
                message: "avatar not available"
            })
        }

        await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: avatarId
            }
        })

        return res.status(200).json({ message: "Avatar Updated" })
    } catch (error) {
        return res.status(400).json({
            message: "Invalid avatar id"
        });
    }
})

userRouter.get("/get-avatar",userMiddleware, async(req,res)=>{

    try {
        const userId = (req.query.id ?? "[]") as any
        console.log("userId ",userId)
        if(!userId){
            return res.status(400).json({
                message: "ID is required"
            })
        }
        const user = await client.user.findUnique({
            where:{
                id: userId
            },
            select:{
                avatar:true
            }
        })
        if(!user){
            return res.status(400).json({
                message: "user not found"
            })
        }
        const avatar = await client.avatar.findUnique({
            where:{
                id: user.avatar?.id
            }
        })
        if(!avatar){
            return res.status(400).json({
                message: "avatar not found"
            })
        }
        console.log('avatar', avatar)

        return res.status(200).json({
            avatar
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })        
    }
})

userRouter.post("/avatar", userMiddleware, async (req, res) => {

    const parsedData = CreateAvatarSchema.safeParse(req.body)

    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed"
        })
    }

    try {

        const avatar = await client.avatar.create({
            data: {
                imageUrl: parsedData.data.imageUrl,
                name: parsedData.data.name,
                // user : 
            }
        })

        return res.status(200).json({
            avatarId: avatar.id
        })

    } catch (error) {
        return res.status(400).json({
            message: error
        })
    }
})