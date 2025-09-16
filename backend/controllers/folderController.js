import db from "../db.js";

export const getFolders = (req, res) => {
  db.all(
    "SELECT * FROM folders WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, folders) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(folders);
    }
  );
};

export const createFolder = (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Folder name is required" });

  db.run(
    "INSERT INTO folders (user_id, name, description) VALUES (?, ?, ?)",
    [req.user.id, name, description],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ id: this.lastID, name, description });
    }
  );
};

export const updateFolder = (req, res) => {
  const { name, description } = req.body;
  const folderId = req.params.id;

  db.run(
    "UPDATE folders SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    [name, description, folderId, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      if (this.changes === 0)
        return res.status(404).json({ error: "Folder not found" });
      res.json({ message: "Folder updated successfully" });
    }
  );
};

export const deleteFolder = (req, res) => {
  const folderId = req.params.id;

  db.run(
    "DELETE FROM folders WHERE id = ? AND user_id = ?",
    [folderId, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      if (this.changes === 0)
        return res.status(404).json({ error: "Folder not found" });
      res.json({ message: "Folder deleted successfully" });
    }
  );
};

export const getFolderStories = (req, res) => {
  const folderId = req.params.id;

  db.all(
    `SELECT 
     s.id, 
     s.title, 
     s.created_at, 
     s.age, 
     s.length, 
     fs.added_at,
     EXISTS(SELECT 1 FROM audio_files af WHERE af.story_id = s.id) AS has_audio
     FROM stories s 
     JOIN folder_stories fs ON s.id = fs.story_id 
     WHERE fs.folder_id = ? AND s.user_id = ? 
     ORDER BY fs.added_at DESC`,
    [folderId, req.user.id],
    (err, stories) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(stories);
    }
  );
};

export const addStoryToFolder = (req, res) => {
  const folderId = req.params.id;
  const { storyId } = req.body;

  if (!storyId) return res.status(400).json({ error: "Story ID is required" });

  db.get(
    "SELECT id FROM folders WHERE id = ? AND user_id = ?",
    [folderId, req.user.id],
    (err, folder) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!folder) return res.status(404).json({ error: "Folder not found" });

      db.get(
        "SELECT id FROM stories WHERE id = ? AND user_id = ?",
        [storyId, req.user.id],
        (storyErr, story) => {
          if (storyErr) return res.status(500).json({ error: "DB error" });
          if (!story) return res.status(404).json({ error: "Story not found" });

          db.run(
            "INSERT OR IGNORE INTO folder_stories (folder_id, story_id) VALUES (?, ?)",
            [folderId, storyId],
            function (insertErr) {
              if (insertErr) return res.status(500).json({ error: "DB error" });
              res.json({ message: "Story added to folder successfully" });
            }
          );
        }
      );
    }
  );
};

export const removeStoryFromFolder = (req, res) => {
  const folderId = req.params.id;
  const storyId = req.params.storyId;

  db.get(
    "SELECT id FROM folders WHERE id = ? AND user_id = ?",
    [folderId, req.user.id],
    (err, folder) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!folder) return res.status(404).json({ error: "Folder not found" });

      db.run(
        "DELETE FROM folder_stories WHERE folder_id = ? AND story_id = ?",
        [folderId, storyId],
        function (deleteErr) {
          if (deleteErr) return res.status(500).json({ error: "DB error" });
          if (this.changes === 0)
            return res.status(404).json({ error: "Story not in folder" });
          res.json({ message: "Story removed from folder successfully" });
        }
      );
    }
  );
};
