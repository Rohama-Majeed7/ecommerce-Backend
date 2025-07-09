import express from "express"
import { allUsers, login, signUp, updateUser, userDetails, userLogout } from "../controllers/user.controller.js"
import authMiddleware from "../middlewares/authMiddleware.js"
import { allOrderController, orderController, paymentController, webhooks } from "../controllers/order.controller.js"
const router = express.Router()
 
router.post("/signup",signUp)
router.post("/login",login)
router.get("/user-details",authMiddleware,userDetails)
router.get("/logout",userLogout)
router.get("/all-users",allUsers)
router.post("/update-user",updateUser)
router.post("/checkout",authMiddleware,paymentController)
router.post("/webhook",webhooks)
router.get("/order-list",authMiddleware,orderController)
router.get("/all-order",authMiddleware,allOrderController)

export default router