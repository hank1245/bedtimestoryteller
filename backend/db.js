import sqlite3 from "sqlite3";
import path from "path";

// 프로덕션에서는 영속적인 경로 사용
const dbPath =
  process.env.NODE_ENV === "production"
    ? path.join("/app/data", "stories.db")
    : "stories.db";

const db = new sqlite3.Database(dbPath);

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

  // Create subscriptions table
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    plan_type TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    payment_provider TEXT,
    subscription_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create payment_history table
  db.run(`CREATE TABLE IF NOT EXISTS payment_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    subscription_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL,
    payment_provider TEXT,
    transaction_id TEXT,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE SET NULL
  )`);

  // Create user_preferences table
  db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    theme TEXT DEFAULT 'dark',
    language TEXT DEFAULT 'en',
    email_notifications BOOLEAN DEFAULT 1,
    audio_auto_play BOOLEAN DEFAULT 1,
    default_story_length TEXT DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add audio_url column to existing table if it doesn't exist (for backward compatibility)
  db.run(`ALTER TABLE stories ADD COLUMN audio_url TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Error adding audio_url column:", err);
    }
  });

  // Add age and length columns for story hashtags
  db.run(`ALTER TABLE stories ADD COLUMN age TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Error adding age column:", err);
    }
  });

  db.run(`ALTER TABLE stories ADD COLUMN length TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Error adding length column:", err);
    }
  });

  // Create folders table
  db.run(`CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create folder_stories junction table
  db.run(`CREATE TABLE IF NOT EXISTS folder_stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folder_id INTEGER NOT NULL,
    story_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE CASCADE,
    FOREIGN KEY (story_id) REFERENCES stories (id) ON DELETE CASCADE,
    UNIQUE(folder_id, story_id)
  )`);
});

export default db;
