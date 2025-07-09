import express from "express"
import  chat  from "../controllers/chat.controller.js"
const router = express.Router()


router.post("/addchat",chat);
export default router

