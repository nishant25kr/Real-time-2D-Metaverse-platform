import jwt from "jsonwebtoken"
import type { NextFunction, Request, Response } from "express"

const JWT_PASSWORD =  process.env.JWT_PASSWORD || "password"

export const adminMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const header = req.headers.authorization

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Token missing" })
    }

    const token = header.split(" ")[1]

    if (!token) {
        return res.status(403).json({ message: "Token malformed" });
    }

    try {
        const decoded = jwt.verify(token, JWT_PASSWORD);

        if (typeof decoded === "string") {
            return res.status(403).json({ message: "Invalid token" });
        }

        if (decoded.role !== "Admin") {
            return res.status(403).json({ message: "Invalid you are not admim" });
        }

        req.userId = decoded.userId;
        next()
    } catch (error) {
        return res.status(403).json({ message: "Unauthorized" })
    }
}