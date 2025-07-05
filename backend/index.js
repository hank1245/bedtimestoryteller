import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./db.js";
import { clerkAuthMiddleware } from "./clerkAuth.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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

// Get specific story by ID (전체 스토리 내용 반환)
app.get("/api/stories/:id", clerkAuthMiddleware, (req, res) => {
  const storyId = req.params.id;
  db.get(
    "SELECT * FROM stories WHERE id = ? AND user_id = ?",
    [storyId, req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!row) return res.status(404).json({ error: "Story not found" });
      res.json(row);
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
