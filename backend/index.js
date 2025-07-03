import express from "express";
import dotenv from "dotenv";
import db from "./db.js";
import { clerkAuthMiddleware } from "./clerkAuth.js";

dotenv.config();

const app = express();
app.use(express.json());

// List stories for the authenticated user
app.get("/api/stories", clerkAuthMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM stories WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    }
  );
});

// Create a new story for the authenticated user
app.post("/api/stories", clerkAuthMiddleware, (req, res) => {
  const { story } = req.body;
  if (!story) return res.status(400).json({ error: "Missing story" });
  db.run(
    "INSERT INTO stories (user_id, story) VALUES (?, ?)",
    [req.user.id, story],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ id: this.lastID, story });
    }
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
