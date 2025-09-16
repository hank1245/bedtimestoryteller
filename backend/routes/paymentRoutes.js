import express from "express";
import { getPaymentHistory, handlePaymentWebhook } from "../controllers/paymentController.js";
import { clerkAuthMiddleware } from "../clerkAuth.js";

const router = express.Router();

router.get("/payments", clerkAuthMiddleware, getPaymentHistory);
router.post(
  "/webhook/payment",
  express.raw({ type: "application/json" }),
  handlePaymentWebhook
);

export default router;
