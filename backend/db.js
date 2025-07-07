import sqlite3 from "sqlite3";

const db = new sqlite3.Database("stories.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    audio_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create audio_files table for voice-specific audio storage
  db.run(`CREATE TABLE IF NOT EXISTS audio_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    voice_id TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories (id) ON DELETE CASCADE,
    UNIQUE(story_id, voice_id)
  )`);

  // Add audio_url column to existing table if it doesn't exist (for backward compatibility)
  db.run(`ALTER TABLE stories ADD COLUMN audio_url TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Error adding audio_url column:", err);
    }
  });
});

export default db;
