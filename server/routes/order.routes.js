import { Router } from "express";
import { createOrder, getAllOrders, getMyOrders, updateOrderStatus, getOrderById } from "../controllers/order.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

// customer
router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// admin
router.get("/", protect, restrictTo("admin"), getAllOrders);
router.patch("/:id", protect, restrictTo("admin"), updateOrderStatus);

export default router;


