import express from "express";
import {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderStories,
  addStoryToFolder,
  removeStoryFromFolder,
} from "../controllers/folderController.js";
import { clerkAuthMiddleware } from "../clerkAuth.js";

const router = express.Router();

router.use(clerkAuthMiddleware);

router.get("/", getFolders);
router.post("/", createFolder);
router.put("/:id", updateFolder);
router.delete("/:id", deleteFolder);
router.get("/:id/stories", getFolderStories);
router.post("/:id/stories", addStoryToFolder);
router.delete("/:id/stories/:storyId", removeStoryFromFolder);

export default router;
