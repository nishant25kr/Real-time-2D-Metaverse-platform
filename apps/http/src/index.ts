import cors from "cors"
import 'dotenv/config'
import express from "express"
import client from "@repo/db"
import { router } from "./routes/v1/index.js"

const app = express()
app.use(cors())
app.use(express.json())
app.use("/api/v1",router)

app.get("/health",(req,res)=>{
    res.json({message:"server is up"})
})

app.listen(process.env.PORT || 3000,()=>{
    console.log("server is running")
}) 