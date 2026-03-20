import { Router } from "express";
import { AddElementSchema, AddSpaceElement, CreateSpaceSchema, DeleteElementSchema, DeleteSpaceSchema } from "../../types/index.js";
import client from "@repo/db"
import { userMiddleware } from "../../middlewares/user.js";

export const spaceRouter = Router()

spaceRouter.post("/", userMiddleware, async (req, res) => {

    const parsedData = CreateSpaceSchema.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid input"
        });
    }

    if (!req.userId) {
        return res.status(400).json({
            message: "User not found"
        })
    }

    if (!parsedData.data.mapId) {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: parsedData.data.width,
                height: parsedData.data.height,
                creatorId: req.userId!
            }
        });
        res.json({ spaceId: space.id })
        return;
    }
    const map = await client.map.findFirst({
        where: {
            id: parsedData.data.mapId
        }, select: {
            mapElements: true,
            width: true,
            height: true
        }
    })
    if (!map) {
        res.status(400).json({ message: "Map not found" })
        return
    }
    let space = await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: map.width.toString(),
                height: map.height.toString(),
                creatorId: req.userId!,
            }
        });

        await client.spaceElements.createMany({
            data: map.mapElements.map((e: any) => ({
                spaceId: space.id,
                elementId: e.elementId,
                x: e.x!,
                y: e.y!
            }))
        })

        return space;

    })
    res.json({ spaceId: space.id })


})

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
    try {

        const parsedData = DeleteElementSchema.safeParse(req.body)

        if (!parsedData.success) {
            return res.status(400).json({
                message: "Validation failed"
            })
        }

        const space = await client.space.findUnique({
            where: {
                id: parsedData.data.spaceId
            }
        })

        if (!space) {
            return res.status(400).json({
                message: "Space not found"
            })
        }

        const element = await client.spaceElements.delete({
            where: {
                id: parsedData.data.elementId
            }
        })

        res.status(200).json({
            message: "delete success"
        })
    } catch (error: any) {
        if (error.code === 'P2025') {
        } else {
            console.error('An error occurred:', error);
        }

    }
})

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
    const parsedData = DeleteSpaceSchema.safeParse(req.params)
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed"
        })
    }
    const spaceId = parsedData.data.spaceId;
    const space = await client.space.findUnique({
        where: {
            id: spaceId
        }
    })
    if (!space) {
        return res.status(400).json({
            message: 'Space not found'
        })
    }
    if (!(space?.creatorId === req.userId)) {
        return res.status(400).json({
            message: "unautho user"
        })
    }
    const deleteSpace = await client.space.delete({
        where: {
            id: spaceId
        }
    });
    return res.status(200).json({
        message: "Deleted successfully",
        space: deleteSpace
    });
});

spaceRouter.get("/:spaceId", async (req, res) => {
    const spaceId = req.params.spaceId as string;
    if (!spaceId) {
        return res.status(400).json({
            message: "no spaceId"
        })
    }
    const space = await client.space.findUnique({
        where: {
            id: spaceId
        }
    });
    const element = await client.spaceElements.findMany({
        where: {
            spaceId: spaceId
        }
    })
    if (!space) {
        return res.status(400).json({
            message: "Invalid id"
        })
    }

    return res.status(200).json({
        space: space,
        element: element
    })
})

spaceRouter.get("/all", async (req, res) => {
    const spaces = await client.space.findMany()
    if (!spaces) {
        return res.status(400).json({
            message: "Spaces not available"
        })
    }

    res.status(200).json({
        spaces: spaces.map((s: any) => ({
            id: s.id,
            name: s.name,
            dimensions: s.width + "x" + s.height,
            thumbnails: s.thumbnail

        }))
    })
})

spaceRouter.post("/element", userMiddleware, async (req, res) => {
    const parsedData = AddSpaceElement.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed"
        })
    }
    const space = await client.space.findUnique({
        where:{
            id: parsedData.data.spaceId
        }
    })
    if(!space){
        return res.status(400).json({
            message:"Invalid space Id"
        })
    }
    const elementRes = await client.spaceElements.create({
        data: {
            elementId : parsedData.data.elementId,
            spaceId: parsedData.data.spaceId,
            x: parsedData.data.x,
            y: parsedData.data.y
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
})


