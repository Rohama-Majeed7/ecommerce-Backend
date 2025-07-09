import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { addToCart, addToCartViewProduct, countCartItems, deleteCartProduct, updateAddToCartProduct } from "../controllers/cart.controller.js";
const router = express.Router();

router.post("/addtocart", authMiddleware, addToCart);
router.get("/cartitemcount",authMiddleware,countCartItems);
router.get("/cartproducts", authMiddleware, addToCartViewProduct);
router.post("/update-cartproduct", authMiddleware, updateAddToCartProduct);
router.delete("/delete-cartproduct/:productID", deleteCartProduct);

export default router;
