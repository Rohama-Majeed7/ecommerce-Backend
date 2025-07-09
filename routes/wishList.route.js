import express from "express"
const router = express.Router();
import { addToWishlist,getWishlist,removeFromWishlist } from "../controllers/wishList.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js"

// Add item to wishlist
router.post('/wishlist',authMiddleware,addToWishlist);

// Get user's wishlist
router.get('/wishlist/:userId',authMiddleware,getWishlist);

// Remove item from wishlist
router.delete('/wishlist/:userId/:productId',authMiddleware,removeFromWishlist);

export default router;
