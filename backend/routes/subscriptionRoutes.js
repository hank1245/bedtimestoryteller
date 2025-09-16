import express from "express";
import {
  getSubscription,
  updateSubscription,
  cancelSubscription,
  createSubscription,
  getSubscriptionLimits,
} from "../controllers/subscriptionController.js";
import { clerkAuthMiddleware } from "../clerkAuth.js";

const router = express.Router();

router.use(clerkAuthMiddleware);

router.get("/", getSubscription);
router.put("/", updateSubscription);
router.post("/cancel", cancelSubscription);
router.post("/create", createSubscription);
router.get("/limits", getSubscriptionLimits);

export default router;
