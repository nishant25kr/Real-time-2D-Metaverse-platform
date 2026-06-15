import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin.js";
import { AddElementSchema, CreateAvatarSchema, CreateMapSchema, UpdateElementSchema } from "../../types/index.js";
import client from "@repo/db"

export const adminRouter = Router()

adminRouter.post("/element", adminMiddleware, async (req, res) => {
    const parsedData = AddElementSchema.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed"
        })
    }

    try {

        const elementRes = await client.element.create({
            data: {
                imageUrl: parsedData.data.imageUrl,
                width: parsedData.data.width,
                height: parsedData.data.height,
                static: true

            }
        })

        if (!elementRes) {
            return res.status(400).json({
                message: " error while uploadin elment"
            })
        }

        return res.status(200).json({
            id: elementRes.id
        })

    } catch (error) {

        return res.status(400).json({
            message: error
        })

    }

})

adminRouter.put("/element", adminMiddleware, async (req, res) => {
    
    const id = req.params.elementId

    if (!id) {
        return res.status(400).json({
            message: "Invalid id"
        })
    }

    const parsedData = UpdateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed"
        })
    }

    try {
        await client.element.findUnique({
            where: {
                id: parsedData.data.imageUrl
            }
        })
    } catch (error) {

    }

})

adminRouter.post("/avatar", adminMiddleware, async (req, res) => {

    const parsedData = CreateAvatarSchema.safeParse(req.body)

    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation fialed"
        })
    }

    try {

        const avatar = await client.avatar.create({
            data: {
                imageUrl: parsedData.data.imageUrl,
                name: parsedData.data.name
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

adminRouter.get("/avatar", adminMiddleware, async (req, res) => {

    try {

        const avatars = await client.avatar.findMany()

        if (!avatars) {
            return res.status(400).json({
                message: "Error while fething data"
            })
        }

        return res.status(200).json({
            avatars: avatars.map((a:any) => ({
                "id": a.id,
                "imageUrl": a.imageUrl
            }))
        })

    } catch (error) {
        return res.status(400).json({
            message: error
        })
    }
})

adminRouter.post("/map", adminMiddleware, async (req, res) => {
    const parsedData = CreateMapSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed"
        })
    }
    const map = await client.map.create({
        data: {
            thumbnail: parsedData.data.thumbnail,
            width: parsedData.data.width,
            height: parsedData.data.height,
            name: parsedData.data.name
        }
    })
    for (let i = 0; i < parsedData.data.defaultElements.length; i++) {
        await client.mapElements.create({
            data: {
                mapId: map.id,
                elementId: parsedData.data.defaultElements[i].elementId,
                x: parsedData.data.defaultElements[i].x,
                y: parsedData.data.defaultElements[i].y,
            }
        })
    }
    return res.status(200).json({
        id: map.id
    })
})



