import db from "../db.js";
import { removeStoredFile } from "../config/storage.js";

export const deleteUserAccount = (req, res) => {
  const userId = req.user.id;

  db.all(
    "SELECT id FROM stories WHERE user_id = ?",
    [userId],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });

      db.all(
        "SELECT audio_url FROM audio_files WHERE story_id IN (SELECT id FROM stories WHERE user_id = ?)",
        [userId],
        (audioErr, audioFiles) => {
          if (audioErr) return res.status(500).json({ error: "DB error" });

          db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            db.run(
              "DELETE FROM audio_files WHERE story_id IN (SELECT id FROM stories WHERE user_id = ?)",
              [userId]
            );

            db.run("DELETE FROM payment_history WHERE user_id = ?", [userId]);
            db.run("DELETE FROM subscriptions WHERE user_id = ?", [userId]);

            db.run(
              "DELETE FROM stories WHERE user_id = ?",
              [userId],
              function (deleteErr) {
                if (deleteErr) {
                  db.run("ROLLBACK");
                  return res
                    .status(500)
                    .json({ error: "Failed to delete user data" });
                }

                db.run("COMMIT", (commitErr) => {
                  if (commitErr) {
                    return res
                      .status(500)
                      .json({ error: "Failed to commit transaction" });
                  }

                  audioFiles.forEach((file) => {
                    if (file.audio_url) {
                      removeStoredFile(file.audio_url);
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
};

export const getUserStats = (req, res) => {
  const userId = req.user.id;

  db.get(
    "SELECT COUNT(*) as story_count FROM stories WHERE user_id = ?",
    [userId],
    (err, storyResult) => {
      if (err) return res.status(500).json({ error: "DB error" });

      db.get(
        "SELECT started_at FROM subscriptions WHERE user_id = ?",
        [userId],
        (subErr, subResult) => {
          if (subErr) return res.status(500).json({ error: "DB error" });

          db.get(
            "SELECT COUNT(DISTINCT DATE(created_at)) as active_days FROM stories WHERE user_id = ?",
            [userId],
            (activityErr, activityResult) => {
              if (activityErr)
                return res.status(500).json({ error: "DB error" });

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
};

export const getUserProfile = (req, res) => {
  const userId = req.user.id;

  res.json({
    user_id: userId,
    email: req.user.emailAddresses?.[0]?.emailAddress || null,
    created_at: req.user.createdAt || new Date().toISOString(),
  });
};

export const updateUserPreferences = (req, res) => {
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
};

export const getUserPreferences = (req, res) => {
  const userId = req.user.id;

  db.get(
    "SELECT * FROM user_preferences WHERE user_id = ?",
    [userId],
    (err, preferences) => {
      if (err) return res.status(500).json({ error: "DB error" });

      if (!preferences) {
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
};

export const exportUserData = (req, res) => {
  const userId = req.user.id;

  db.all(
    "SELECT * FROM stories WHERE user_id = ?",
    [userId],
    (err, stories) => {
      if (err) return res.status(500).json({ error: "DB error" });

      db.get(
        "SELECT * FROM subscriptions WHERE user_id = ?",
        [userId],
        (subErr, subscription) => {
          if (subErr) return res.status(500).json({ error: "DB error" });

          db.all(
            "SELECT * FROM payment_history WHERE user_id = ?",
            [userId],
            (paymentErr, paymentHistory) => {
              if (paymentErr) return res.status(500).json({ error: "DB error" });

              const exportData = {
                user_id: userId,
                export_date: new Date().toISOString(),
                stories: stories.map((story) => ({
                  ...story,
                  audio_url: story.audio_url ? "Audio file available" : null,
                })),
                subscription,
                payment_history: paymentHistory,
              };

              res.json(exportData);
            }
          );
        }
      );
    }
  );
};
