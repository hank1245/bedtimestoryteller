import express from "express";
import multer from "multer";
import {
  listStories,
  getStoryById,
  createStory,
  uploadStoryAudio,
  deleteStory,
} from "../controllers/storyController.js";
import { getUploadsDir } from "../config/storage.js";
import { clerkAuthMiddleware } from "../clerkAuth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadsDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `story-${uniqueSuffix}.mp3`);
  },
});

const upload = multer({ storage });

router.use(clerkAuthMiddleware);

router.get("/", listStories);
router.get("/:id", getStoryById);
router.post("/", createStory);
router.post("/:id/audio", upload.single("audio"), uploadStoryAudio);
router.delete("/:id", deleteStory);

export default router;
