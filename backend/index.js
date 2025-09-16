import "dotenv/config";
import express from "express";
import cors from "cors";

import {
  ensureStorageDirectories,
  getUploadsDir,
} from "./config/storage.js";
import healthRoutes from "./routes/healthRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";

const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

ensureStorageDirectories();
app.use("/uploads", express.static(getUploadsDir()));

app.use("/", healthRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/folders", folderRoutes);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV === "production") {
  console.log("🚀 Running in production mode");

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
  console.log(`📁 Uploads directory: ${getUploadsDir()}`);
});
