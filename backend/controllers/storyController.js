import fs from "fs";
import db from "../db.js";
import { removeStoredFile } from "../config/storage.js";

export const listStories = (req, res) => {
  const sql = `
    SELECT 
      s.id, s.title, s.created_at, s.age, s.length,
      EXISTS(SELECT 1 FROM audio_files af WHERE af.story_id = s.id) AS has_audio
    FROM stories s
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `;

  db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
};

export const getStoryById = (req, res) => {
  const storyId = req.params.id;

  db.get(
    "SELECT * FROM stories WHERE id = ? AND user_id = ?",
    [storyId, req.user.id],
    (err, story) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!story) return res.status(404).json({ error: "Story not found" });

      db.all(
        "SELECT voice_id, audio_url FROM audio_files WHERE story_id = ?",
        [storyId],
        (audioErr, audioFiles) => {
          if (audioErr) return res.status(500).json({ error: "DB error" });

          const audioUrls = {};
          audioFiles.forEach((file) => {
            audioUrls[file.voice_id] = file.audio_url;
          });

          res.json({
            ...story,
            audio_urls: audioUrls,
          });
        }
      );
    }
  );
};

export const createStory = (req, res) => {
  const { title, story, age, length } = req.body;
  if (!title || !story)
    return res.status(400).json({ error: "Missing title or story" });

  db.run(
    "INSERT INTO stories (user_id, title, story, age, length) VALUES (?, ?, ?, ?, ?)",
    [req.user.id, title, story, age, length],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ id: this.lastID, title, story, age, length });
    }
  );
};

export const uploadStoryAudio = (req, res) => {
  const storyId = req.params.id;
  const { voice } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No audio file provided" });
  }

  if (!voice) {
    return res.status(400).json({ error: "Voice ID is required" });
  }

  const audioUrl = `/uploads/${req.file.filename}`;

  db.get(
    "SELECT id FROM stories WHERE id = ? AND user_id = ?",
    [storyId, req.user.id],
    (err, story) => {
      if (err) {
        return res.status(500).json({ error: "DB error" });
      }
      if (!story) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: "Story not found" });
      }

      db.run(
        `INSERT OR REPLACE INTO audio_files (story_id, voice_id, audio_url) 
         VALUES (?, ?, ?)`,
        [storyId, voice, audioUrl],
        function (insertErr) {
          if (insertErr) {
            fs.unlinkSync(req.file.path);
            return res.status(500).json({ error: "DB error" });
          }
          res.json({ audioUrl, voice });
        }
      );
    }
  );
};

export const deleteStory = (req, res) => {
  const storyId = req.params.id;

  db.all(
    "SELECT audio_url FROM audio_files WHERE story_id = ?",
    [storyId],
    (err, audioFiles) => {
      if (err) return res.status(500).json({ error: "DB error" });

      db.get(
        "SELECT audio_url FROM stories WHERE id = ? AND user_id = ?",
        [storyId, req.user.id],
        (storyErr, story) => {
          if (storyErr) return res.status(500).json({ error: "DB error" });

          db.run(
            "DELETE FROM audio_files WHERE story_id = ?",
            [storyId],
            (deleteAudioErr) => {
              if (deleteAudioErr)
                return res.status(500).json({ error: "DB error" });

              db.run(
                "DELETE FROM stories WHERE id = ? AND user_id = ?",
                [storyId, req.user.id],
                function (deleteStoryErr) {
                  if (deleteStoryErr)
                    return res.status(500).json({ error: "DB error" });
                  if (this.changes === 0) {
                    return res.status(404).json({ error: "Story not found" });
                  }

                  audioFiles.forEach((file) => {
                    if (file.audio_url) {
                      removeStoredFile(file.audio_url);
                    }
                  });

                  if (story && story.audio_url) {
                    removeStoredFile(story.audio_url);
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
};
