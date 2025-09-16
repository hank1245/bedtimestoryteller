import express from "express";
import {
  deleteUserAccount,
  getUserStats,
  getUserProfile,
  updateUserPreferences,
  getUserPreferences,
  exportUserData,
} from "../controllers/userController.js";
import { clerkAuthMiddleware } from "../clerkAuth.js";

const router = express.Router();

router.use(clerkAuthMiddleware);

router.delete("/account", deleteUserAccount);
router.get("/stats", getUserStats);
router.get("/profile", getUserProfile);
router.put("/preferences", updateUserPreferences);
router.get("/preferences", getUserPreferences);
router.get("/export", exportUserData);

export default router;
