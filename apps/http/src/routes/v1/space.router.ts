import { Router } from "express";
import { 
    AddSpaceElement, 
    CreateSpaceSchema, 
    DeleteElementSchema, 
    DeleteSpaceSchema 
} from "../../types/index.js";
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
    // let space = await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                creatorId: req.userId!,
                passcode: parsedData.data.passcode
            }
        });

        
        // return space;

    // })
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

spaceRouter.get("/all", async (req, res) => {
    const spaces = await client.space.findMany()
    console.log('spaces', spaces)
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
        where: {
            id: parsedData.data.spaceId
        }
    })
    if (!space) {
        return res.status(400).json({
            message: "Invalid space Id"
        })
    }
    const elementRes = await client.spaceElements.create({
        data: {
            elementId: parsedData.data.elementId,
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

spaceRouter.get("/:spaceId/:passcode", async (req, res) => {
    const spaceId = req.params.spaceId as string;
    const passcode = req.params.passcode as string;
    console.log(spaceId, passcode)
    if (!spaceId) {
        return res.status(400).json({
            message: "no spaceId"
        })
    }
    const space = await client.space.findUnique({
        where: {
            id: spaceId,
            passcode: passcode
        }
    });

    console.log(space)

    if (!space) {
        return res.status(400).json({
            message: "Invalid id"
        })
    }
    
    
    return res.status(200).json({
        space: space,
    })
})