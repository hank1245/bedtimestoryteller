import db from "../db.js";

export const getSubscription = (req, res) => {
  db.get(
    "SELECT * FROM subscriptions WHERE user_id = ?",
    [req.user.id],
    (err, subscription) => {
      if (err) return res.status(500).json({ error: "DB error" });

      if (!subscription) {
        db.run(
          "INSERT INTO subscriptions (user_id, plan_type, status) VALUES (?, 'free', 'active')",
          [req.user.id],
          function (insertErr) {
            if (insertErr) return res.status(500).json({ error: "DB error" });
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
};

export const updateSubscription = (req, res) => {
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
};

export const cancelSubscription = (req, res) => {
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
};

export const createSubscription = (req, res) => {
  const { plan_type, payment_provider, subscription_id, expires_at } = req.body;
  const userId = req.user.id;

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
        (paymentErr) => {
          if (paymentErr) {
            console.error("Payment record error:", paymentErr);
          }
        }
      );

      res.json({
        message: "Subscription created successfully",
        subscription_id: this.lastID,
      });
    }
  );
};

export const getSubscriptionLimits = (req, res) => {
  const userId = req.user.id;

  db.get(
    "SELECT plan_type, status FROM subscriptions WHERE user_id = ?",
    [userId],
    (err, subscription) => {
      if (err) return res.status(500).json({ error: "DB error" });

      const currentMonth = new Date().toISOString().slice(0, 7);

      db.get(
        "SELECT COUNT(*) as story_count FROM stories WHERE user_id = ? AND created_at LIKE ?",
        [userId, `${currentMonth}%`],
        (usageErr, result) => {
          if (usageErr) return res.status(500).json({ error: "DB error" });

          const limits = {
            free: { monthly_stories: 5, audio_quality: "standard" },
            premium: { monthly_stories: 50, audio_quality: "high" },
            pro: { monthly_stories: -1, audio_quality: "premium" },
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
};
