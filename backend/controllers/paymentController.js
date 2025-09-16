import db from "../db.js";

export const getPaymentHistory = (req, res) => {
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
};

export const handlePaymentWebhook = (req, res) => {
  res.status(200).send("OK");
};
