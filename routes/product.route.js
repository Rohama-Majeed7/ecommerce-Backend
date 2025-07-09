import express from "express";
import {
  uploadProduct,
  allProducts,
  deleteProducts,
  updateProduct,
  getProductCategories,
  getCategoryWiseProducts,
  getSingleProductDetails,
  searchProducts,
  filterProducts,
} from "../controllers/product.controller.js";
import { paymentController } from "../controllers/order.controller.js";
const router = express.Router();

router.post("/upload-product", uploadProduct);
router.get("/get-products", allProducts);
router.delete("/delete-product/:id", deleteProducts);
router.get("/single-product/:productId", getSingleProductDetails);

router.post("/update-product",updateProduct)
router.get("/get-category",getProductCategories)
router.post("/get-category-wiseProduct",getCategoryWiseProducts)
router.get("/search",searchProducts)
router.post("/filter-product",filterProducts)

export default router;
