import express from "express"
import { addReview, getReview, deleteReview } from "../controllers/review.controller.js"
const router = express.Router()


router.post("/addreview",addReview);
router.get("/getreview/:productId",getReview)
router.delete("/deletereview/:id",deleteReview)

export default router

