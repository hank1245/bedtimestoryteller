import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import db from "./db.js";
import { clerkAuthMiddleware } from "./clerkAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `story-${uniqueSuffix}.mp3`);
  },
});

const upload = multer({ storage });

// List stories for the authenticated user (title만 반환)
app.get("/api/stories", clerkAuthMiddleware, (req, res) => {
  db.all(
    "SELECT id, title, created_at FROM stories WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    }
  );
});

// Get specific story by ID with audio files
app.get("/api/stories/:id", clerkAuthMiddleware, (req, res) => {
  const storyId = req.params.id;

  // Get story data
  db.get(
    "SELECT * FROM stories WHERE id = ? AND user_id = ?",
    [storyId, req.user.id],
    (err, story) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!story) return res.status(404).json({ error: "Story not found" });

      // Get all audio files for this story
      db.all(
        "SELECT voice_id, audio_url FROM audio_files WHERE story_id = ?",
        [storyId],
        (err, audioFiles) => {
          if (err) return res.status(500).json({ error: "DB error" });

          // Convert array to object for easier access
          const audioUrls = {};
          audioFiles.forEach((file) => {
            audioUrls[file.voice_id] = file.audio_url;
          });

          res.json({
            ...story,
            audio_urls: audioUrls, // Multiple audio URLs by voice
          });
        }
      );
    }
  );
});

// Create a new story for the authenticated user
app.post("/api/stories", clerkAuthMiddleware, (req, res) => {
  const { title, story } = req.body;
  if (!title || !story)
    return res.status(400).json({ error: "Missing title or story" });
  db.run(
    "INSERT INTO stories (user_id, title, story) VALUES (?, ?, ?)",
    [req.user.id, title, story],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ id: this.lastID, title, story });
    }
  );
});

// Upload audio file for a story
app.post(
  "/api/stories/:id/audio",
  clerkAuthMiddleware,
  upload.single("audio"),
  (req, res) => {
    const storyId = req.params.id;
    const { voice } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (!voice) {
      return res.status(400).json({ error: "Voice ID is required" });
    }

    const audioUrl = `/uploads/${req.file.filename}`;

    // First verify the story exists and belongs to the user
    db.get(
      "SELECT id FROM stories WHERE id = ? AND user_id = ?",
      [storyId, req.user.id],
      (err, story) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (!story) {
          fs.unlinkSync(req.file.path);
          return res.status(404).json({ error: "Story not found" });
        }

        // Insert or replace audio file for this voice
        db.run(
          `INSERT OR REPLACE INTO audio_files (story_id, voice_id, audio_url) 
           VALUES (?, ?, ?)`,
          [storyId, voice, audioUrl],
          function (err) {
            if (err) {
              fs.unlinkSync(req.file.path);
              return res.status(500).json({ error: "DB error" });
            }
            res.json({ audioUrl, voice });
          }
        );
      }
    );
  }
);

// Delete a story for the authenticated user
app.delete("/api/stories/:id", clerkAuthMiddleware, (req, res) => {
  const storyId = req.params.id;

  // First, get all audio files for this story
  db.all(
    "SELECT audio_url FROM audio_files WHERE story_id = ?",
    [storyId],
    (err, audioFiles) => {
      if (err) return res.status(500).json({ error: "DB error" });

      // Also get legacy audio_url from stories table
      db.get(
        "SELECT audio_url FROM stories WHERE id = ? AND user_id = ?",
        [storyId, req.user.id],
        (err, story) => {
          if (err) return res.status(500).json({ error: "DB error" });

          // Delete audio files from audio_files table
          db.run(
            "DELETE FROM audio_files WHERE story_id = ?",
            [storyId],
            (err) => {
              if (err) return res.status(500).json({ error: "DB error" });

              // Delete the story from database
              db.run(
                "DELETE FROM stories WHERE id = ? AND user_id = ?",
                [storyId, req.user.id],
                function (err) {
                  if (err) return res.status(500).json({ error: "DB error" });
                  if (this.changes === 0) {
                    return res.status(404).json({ error: "Story not found" });
                  }

                  // Delete all audio files from filesystem
                  audioFiles.forEach((file) => {
                    if (file.audio_url) {
                      const audioPath = path.join(__dirname, file.audio_url);
                      if (fs.existsSync(audioPath)) {
                        fs.unlinkSync(audioPath);
                      }
                    }
                  });

                  // Delete legacy audio file if it exists
                  if (story && story.audio_url) {
                    const audioPath = path.join(__dirname, story.audio_url);
                    if (fs.existsSync(audioPath)) {
                      fs.unlinkSync(audioPath);
                    }
                  }

                  res.json({ message: "Story deleted successfully" });
                }
              );
            }
          );
        }
      );
    }
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
