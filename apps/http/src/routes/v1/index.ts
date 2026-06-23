import { Router } from "express";
import { adminRouter } from "./admin.router.js";
import { userRouter } from "./user.router.js";
import { spaceRouter } from "./space.router.js";
import { CreateAvatarSchema, SignInSchema, SignUpSchema } from "../../types/index.js";
import client from "@repo/db"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const JWT_PASSWORD =  process.env.JWT_PASSWORD || "password"

export const router = Router()

router.post("/signup", async (req, res) => {
    const parsedData = SignUpSchema.safeParse(req.body)

    if (!parsedData.success) {
        return res.status(400).json({ message: "validation failed" })
    }

    try {
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 10)
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.type === "admin" ? "Admin" : "User"
            }
        })

        return res.status(200).json({
            userId: user.id
        })
    } catch (error) {
        return res.status(400).json({ message: "user already exists" })
    }
})

router.post("/signin", async (req, res) => {
    
    const parsedData = SignInSchema.safeParse(req.body)

    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }

    try {
        const user = await client.user.findUnique({
            where:{
                username: parsedData.data.username
            }
        })

        if(!user){
            return res.status(400).json({message: "user not found"})
        }

        const isValid = await bcrypt.compare(parsedData.data.password, user.password)

        if(!isValid){
            return res.status(400).json({
                message: "Invalid password"
            })
        }

        const token = jwt.sign({
            userId : user.id,
            role : user.role
        },JWT_PASSWORD)

        return res.status(200).json({
            token: token,
            userId: user.id
        })

    } catch (error) {
        return res.status(400).json({message: "Error during signin"})
    }

})

router.post("/elements", (req, res) => {
    
})


router.use("/admin", adminRouter)
router.use("/space", spaceRouter)
router.use("/user", userRouter)