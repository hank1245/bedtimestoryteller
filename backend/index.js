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

// CORS 설정 - 환경별로 분리
const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));

// Create uploads directory if it doesn't exist
const uploadsDir =
  process.env.NODE_ENV === "production"
    ? path.join("/app/data", "uploads")
    : path.join(__dirname, "uploads");

// Create data and uploads directories if they don't exist
if (process.env.NODE_ENV === "production") {
  const dataDir = "/app/data";
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Storyteller API",
    version: "1.0.0",
    status: "running",
  });
});

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
    "SELECT id, title, created_at, age, length FROM stories WHERE user_id = ? ORDER BY created_at DESC",
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
                      const audioPath =
                        process.env.NODE_ENV === "production"
                          ? path.join("/app/data", file.audio_url)
                          : path.join(__dirname, file.audio_url);
                      if (fs.existsSync(audioPath)) {
                        fs.unlinkSync(audioPath);
                      }
                    }
                  });

                  // Delete legacy audio file if it exists
                  if (story && story.audio_url) {
                    const audioPath =
                      process.env.NODE_ENV === "production"
                        ? path.join("/app/data", story.audio_url)
                        : path.join(__dirname, story.audio_url);
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

// Subscription Management APIs

// Get user subscription status
app.get("/api/subscription", clerkAuthMiddleware, (req, res) => {
  db.get(
    "SELECT * FROM subscriptions WHERE user_id = ?",
    [req.user.id],
    (err, subscription) => {
      if (err) return res.status(500).json({ error: "DB error" });

      // If no subscription exists, create a free plan
      if (!subscription) {
        db.run(
          "INSERT INTO subscriptions (user_id, plan_type, status) VALUES (?, 'free', 'active')",
          [req.user.id],
          function (err) {
            if (err) return res.status(500).json({ error: "DB error" });
            res.json({
              id: this.lastID,
              user_id: req.user.id,
              plan_type: "free",
              status: "active",
              started_at: new Date().toISOString(),
              expires_at: null,
            });
          }
        );
      } else {
        res.json(subscription);
      }
    }
  );
});

// Update subscription
app.put("/api/subscription", clerkAuthMiddleware, (req, res) => {
  const { plan_type, status, expires_at, payment_provider, subscription_id } =
    req.body;

  db.run(
    `UPDATE subscriptions 
     SET plan_type = ?, status = ?, expires_at = ?, payment_provider = ?, 
         subscription_id = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE user_id = ?`,
    [
      plan_type,
      status,
      expires_at,
      payment_provider,
      subscription_id,
      req.user.id,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      if (this.changes === 0) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json({ message: "Subscription updated successfully" });
    }
  );
});

// Cancel subscription
app.post("/api/subscription/cancel", clerkAuthMiddleware, (req, res) => {
  db.run(
    `UPDATE subscriptions 
     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
     WHERE user_id = ?`,
    [req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      if (this.changes === 0) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json({ message: "Subscription cancelled successfully" });
    }
  );
});

// Create subscription (for payment integration)
app.post("/api/subscription/create", clerkAuthMiddleware, (req, res) => {
  const { plan_type, payment_provider, subscription_id, expires_at } = req.body;
  const userId = req.user.id;

  // Create or update subscription
  db.run(
    `INSERT OR REPLACE INTO subscriptions 
     (user_id, plan_type, status, expires_at, payment_provider, subscription_id, started_at, updated_at) 
     VALUES (?, ?, 'active', ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [userId, plan_type, expires_at, payment_provider, subscription_id],
    function (err) {
      if (err) {
        console.error("Subscription creation error:", err);
        return res.status(500).json({ error: "Failed to create subscription" });
      }

      // Create payment record
      db.run(
        `INSERT INTO payment_history 
         (user_id, subscription_id, amount, currency, status, payment_provider, transaction_id, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          this.lastID,
          plan_type === "premium" ? 3.99 : 0,
          "USD",
          "completed",
          payment_provider,
          `txn_${Date.now()}`,
          `${plan_type} subscription payment`,
        ],
        (err) => {
          if (err) {
            console.error("Payment record error:", err);
            // Continue even if payment record fails
          }
        }
      );

      res.json({
        message: "Subscription created successfully",
        subscription_id: this.lastID,
      });
    }
  );
});

// Get payment history
app.get("/api/payments", clerkAuthMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM payment_history WHERE user_id = ? ORDER BY payment_date DESC",
    [req.user.id],
    (err, payments) => {
      if (err) {
        console.error("Payment history error:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch payment history" });
      }
      res.json(payments);
    }
  );
});

// Webhook endpoint for payment providers (e.g., Stripe)
app.post(
  "/api/webhook/payment",
  express.raw({ type: "application/json" }),
  (req, res) => {
    // This would handle webhook events from payment providers
    // For now, just acknowledge
    res.status(200).send("OK");
  }
);

// Check subscription limits
app.get("/api/subscription/limits", clerkAuthMiddleware, (req, res) => {
  const userId = req.user.id;

  db.get(
    "SELECT plan_type, status FROM subscriptions WHERE user_id = ?",
    [userId],
    (err, subscription) => {
      if (err) return res.status(500).json({ error: "DB error" });

      // Count current month's stories
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      db.get(
        "SELECT COUNT(*) as story_count FROM stories WHERE user_id = ? AND created_at LIKE ?",
        [userId, `${currentMonth}%`],
        (err, result) => {
          if (err) return res.status(500).json({ error: "DB error" });

          const limits = {
            free: { monthly_stories: 5, audio_quality: "standard" },
            premium: { monthly_stories: 50, audio_quality: "high" },
            pro: { monthly_stories: -1, audio_quality: "premium" }, // unlimited
          };

          const planType = subscription?.plan_type || "Free";
          const planLimits = limits[planType];
          const currentUsage = result.story_count;

          res.json({
            plan_type: planType,
            current_usage: currentUsage,
            limits: planLimits,
            can_create_story:
              planLimits.monthly_stories === -1 ||
              currentUsage < planLimits.monthly_stories,
          });
        }
      );
    }
  );
});

// Delete user account (with all associated data)
app.delete("/api/user/account", clerkAuthMiddleware, (req, res) => {
  const userId = req.user.id;

  // Get all stories with audio files first
  db.all(
    "SELECT id FROM stories WHERE user_id = ?",
    [userId],
    (err, stories) => {
      if (err) return res.status(500).json({ error: "DB error" });

      // Get all audio files for cleanup
      db.all(
        "SELECT audio_url FROM audio_files WHERE story_id IN (SELECT id FROM stories WHERE user_id = ?)",
        [userId],
        (err, audioFiles) => {
          if (err) return res.status(500).json({ error: "DB error" });

          // Start transaction to delete all user data
          db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Delete audio files records
            db.run(
              "DELETE FROM audio_files WHERE story_id IN (SELECT id FROM stories WHERE user_id = ?)",
              [userId]
            );

            // Delete payment history
            db.run("DELETE FROM payment_history WHERE user_id = ?", [userId]);

            // Delete subscription
            db.run("DELETE FROM subscriptions WHERE user_id = ?", [userId]);

            // Delete stories
            db.run(
              "DELETE FROM stories WHERE user_id = ?",
              [userId],
              function (err) {
                if (err) {
                  db.run("ROLLBACK");
                  return res
                    .status(500)
                    .json({ error: "Failed to delete user data" });
                }

                db.run("COMMIT", (err) => {
                  if (err) {
                    return res
                      .status(500)
                      .json({ error: "Failed to commit transaction" });
                  }

                  // Delete audio files from filesystem
                  audioFiles.forEach((file) => {
                    if (file.audio_url) {
                      const audioPath =
                        process.env.NODE_ENV === "production"
                          ? path.join("/app/data", file.audio_url)
                          : path.join(__dirname, file.audio_url);
                      if (fs.existsSync(audioPath)) {
                        fs.unlinkSync(audioPath);
                      }
                    }
                  });

                  res.json({
                    message:
                      "User account and all associated data deleted successfully",
                  });
                });
              }
            );
          });
        }
      );
    }
  );
});

// Get user statistics
app.get("/api/user/stats", clerkAuthMiddleware, (req, res) => {
  const userId = req.user.id;

  // Get story count
  db.get(
    "SELECT COUNT(*) as story_count FROM stories WHERE user_id = ?",
    [userId],
    (err, storyResult) => {
      if (err) return res.status(500).json({ error: "DB error" });

      // Get subscription info for join date
      db.get(
        "SELECT started_at FROM subscriptions WHERE user_id = ?",
        [userId],
        (err, subResult) => {
          if (err) return res.status(500).json({ error: "DB error" });

          // Calculate total audio duration (if available)
          db.get(
            "SELECT COUNT(DISTINCT DATE(created_at)) as active_days FROM stories WHERE user_id = ?",
            [userId],
            (err, activityResult) => {
              if (err) return res.status(500).json({ error: "DB error" });

              res.json({
                story_count: storyResult.story_count,
                member_since: subResult
                  ? subResult.started_at
                  : new Date().toISOString(),
                active_days: activityResult.active_days || 0,
              });
            }
          );
        }
      );
    }
  );
});

// Get user profile info
app.get("/api/user/profile", clerkAuthMiddleware, (req, res) => {
  const userId = req.user.id;

  // For now, return basic info - could be extended with user preferences
  res.json({
    user_id: userId,
    email: req.user.emailAddresses?.[0]?.emailAddress || null,
    created_at: req.user.createdAt || new Date().toISOString(),
  });
});

// Update user preferences (could be extended)
app.put("/api/user/preferences", clerkAuthMiddleware, (req, res) => {
  const userId = req.user.id;
  const {
    theme,
    language,
    email_notifications,
    audio_auto_play,
    default_story_length,
  } = req.body;

  db.run(
    `INSERT OR REPLACE INTO user_preferences 
     (user_id, theme, language, email_notifications, audio_auto_play, default_story_length, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      userId,
      theme,
      language,
      email_notifications,
      audio_auto_play,
      default_story_length,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "Preferences updated successfully" });
    }
  );
});

// Get user preferences
app.get("/api/user/preferences", clerkAuthMiddleware, (req, res) => {
  const userId = req.user.id;

  db.get(
    "SELECT * FROM user_preferences WHERE user_id = ?",
    [userId],
    (err, preferences) => {
      if (err) return res.status(500).json({ error: "DB error" });

      if (!preferences) {
        // Return default preferences if none exist
        return res.json({
          theme: "dark",
          language: "en",
          email_notifications: true,
          audio_auto_play: true,
          default_story_length: "medium",
        });
      }

      res.json(preferences);
    }
  );
});

// Folder Management APIs

// Get all folders for the authenticated user
app.get("/api/folders", clerkAuthMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM folders WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, folders) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(folders);
    }
  );
});

// Create a new folder
app.post("/api/folders", clerkAuthMiddleware, (req, res) => {
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
});

// Update folder
app.put("/api/folders/:id", clerkAuthMiddleware, (req, res) => {
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
});

// Delete folder
app.delete("/api/folders/:id", clerkAuthMiddleware, (req, res) => {
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
});

// Get stories in a specific folder
app.get("/api/folders/:id/stories", clerkAuthMiddleware, (req, res) => {
  const folderId = req.params.id;

  db.all(
    `SELECT s.id, s.title, s.created_at, s.age, s.length, fs.added_at 
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
});

// Add story to folder
app.post("/api/folders/:id/stories", clerkAuthMiddleware, (req, res) => {
  const folderId = req.params.id;
  const { storyId } = req.body;

  if (!storyId) return res.status(400).json({ error: "Story ID is required" });

  // Verify folder belongs to user and story exists
  db.get(
    "SELECT id FROM folders WHERE id = ? AND user_id = ?",
    [folderId, req.user.id],
    (err, folder) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!folder) return res.status(404).json({ error: "Folder not found" });

      db.get(
        "SELECT id FROM stories WHERE id = ? AND user_id = ?",
        [storyId, req.user.id],
        (err, story) => {
          if (err) return res.status(500).json({ error: "DB error" });
          if (!story) return res.status(404).json({ error: "Story not found" });

          db.run(
            "INSERT OR IGNORE INTO folder_stories (folder_id, story_id) VALUES (?, ?)",
            [folderId, storyId],
            function (err) {
              if (err) return res.status(500).json({ error: "DB error" });
              res.json({ message: "Story added to folder successfully" });
            }
          );
        }
      );
    }
  );
});

// Remove story from folder
app.delete(
  "/api/folders/:id/stories/:storyId",
  clerkAuthMiddleware,
  (req, res) => {
    const folderId = req.params.id;
    const storyId = req.params.storyId;

    // Verify folder belongs to user
    db.get(
      "SELECT id FROM folders WHERE id = ? AND user_id = ?",
      [folderId, req.user.id],
      (err, folder) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (!folder) return res.status(404).json({ error: "Folder not found" });

        db.run(
          "DELETE FROM folder_stories WHERE folder_id = ? AND story_id = ?",
          [folderId, storyId],
          function (err) {
            if (err) return res.status(500).json({ error: "DB error" });
            if (this.changes === 0)
              return res.status(404).json({ error: "Story not in folder" });
            res.json({ message: "Story removed from folder successfully" });
          }
        );
      }
    );
  }
);

// Export user data
app.get("/api/user/export", clerkAuthMiddleware, (req, res) => {
  const userId = req.user.id;

  // Get all user data
  db.all(
    "SELECT * FROM stories WHERE user_id = ?",
    [userId],
    (err, stories) => {
      if (err) return res.status(500).json({ error: "DB error" });

      db.get(
        "SELECT * FROM subscriptions WHERE user_id = ?",
        [userId],
        (err, subscription) => {
          if (err) return res.status(500).json({ error: "DB error" });

          db.all(
            "SELECT * FROM payment_history WHERE user_id = ?",
            [userId],
            (err, paymentHistory) => {
              if (err) return res.status(500).json({ error: "DB error" });

              const exportData = {
                user_id: userId,
                export_date: new Date().toISOString(),
                stories: stories.map((story) => ({
                  ...story,
                  // Remove file paths for privacy
                  audio_url: story.audio_url ? "Audio file available" : null,
                })),
                subscription: subscription,
                payment_history: paymentHistory,
              };

              res.json(exportData);
            }
          );
        }
      );
    }
  );
});

const PORT = process.env.PORT || 4000;

// 프로덕션 환경 체크
if (process.env.NODE_ENV === "production") {
  console.log("🚀 Running in production mode");

  // 필수 환경 변수 체크
  const requiredEnvVars = ["CLERK_SECRET_KEY", "FRONTEND_URL"];
  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingEnvVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingEnvVars);
    process.exit(1);
  }

  console.log("✅ All required environment variables are set");
} else {
  console.log("🔧 Running in development mode");
}

app.listen(PORT, () => {
  console.log(`🌐 Backend listening on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
