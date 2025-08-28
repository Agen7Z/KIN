import { Router } from "express";
import { deleteUser, getAllUsers, updateUserRole, getMe } from "../controllers/user.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", protect, getMe);
router.get("/", protect, restrictTo("admin"), getAllUsers);
router.patch("/:id/role", protect, restrictTo("admin"), updateUserRole);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);

export default router;


