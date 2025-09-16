import express from "express";
import {
  getHealthStatus,
  getRootInfo,
} from "../controllers/healthController.js";

const router = express.Router();

router.get("/health", getHealthStatus);
router.get("/", getRootInfo);

export default router;
