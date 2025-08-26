import { Router } from "express";
import { createProduct, deleteProduct, getProductBySlug, getProducts, updateProduct } from "../controllers/product.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

router.post("/", protect, restrictTo("admin"), createProduct);
router.patch("/:id", protect, restrictTo("admin"), updateProduct);
router.delete("/:id", protect, restrictTo("admin"), deleteProduct);

export default router;


