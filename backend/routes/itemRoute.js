import express from "express";
import authMiddleware from "../middleware/auth.js";
import adminAuthMiddleware from "../middleware/adminAuth.js";

// nếu bạn có upload/image/controller thì import như cũ
import { createItem, deleteItem, getItems, updateItem, quickUpdateItem } from "../controllers/itemController.js";
import upload from "../middleware/multer.js";

const itemRouter = express.Router();

// Public or user
itemRouter.get("/", getItems);

// Admin only
itemRouter.post(
  "/",
  authMiddleware,
  adminAuthMiddleware,
  upload.single("image"),
  createItem
);

// Quick update - chỉ price và quantity
itemRouter.patch("/:id", authMiddleware, adminAuthMiddleware, quickUpdateItem);

// Full update - toàn bộ item có thể có ảnh
itemRouter.put("/:id", authMiddleware, adminAuthMiddleware, upload.single("image"), updateItem);

itemRouter.delete("/:id", authMiddleware, adminAuthMiddleware, deleteItem);

export default itemRouter;
