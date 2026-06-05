import z from "zod";

import "express";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const SignUpSchema = z.object({
    username: z.string(),
    password: z.string().min(8),
    type: z.enum(["user", "admin"])
})

export const SignInSchema = z.object({
    username: z.string(),
    password: z.string().min(8)
})

export const UpdateMetadataSchema = z.object({
    avatarId: z.string()
})

export const CreateSpaceSchema = z.object({
    name: z.string(),
    passcode: z.string()
})

export const AddElementSchema = z.object({
    imageUrl: z.string(),
    static: z.boolean(),
    width: z.number(),
    height: z.number(),
})

export const AddSpaceElement = z.object({
    elementId: z.string(),
    spaceId: z.string(),
    x: z.number(),
    y: z.number()
})

export const CreateElementSchema = z.object({
    imageUrl: z.string(),
    width: z.string(),
    height: z.string(),
    static: z.boolean()
})

export const UpdateElementSchema = z.object({
    imageUrl: z.string()
})

export const CreateAvatarSchema = z.object({
    name: z.string(),
    imageUrl: z.string()
})

export const CreateMapSchema = z.object({
    thumbnail: z.string(),
    width: z.number(),
    height: z.number(),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number()
    })),
    name: z.string()
})

export const DeleteElementSchema = z.object({
    spaceId: z.string(),
    elementId: z.string()
})

export const DeleteSpaceSchema = z.object({
    spaceId: z.string()
})
