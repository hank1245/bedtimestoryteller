import { clerkClient } from "@clerk/clerk-sdk-node";
import { verifyToken } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";
dotenv.config();

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY is not configured in .env file");
  process.exit(1);
}

export async function clerkAuthMiddleware(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }

  const sessionToken = auth.replace("Bearer ", "");

  try {
    // Clerk SDK를 사용하여 토큰 검증
    const payload = await verifyToken(sessionToken, {
      secretKey: CLERK_SECRET_KEY,
    });

    if (!payload || !payload.sub) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = { id: payload.sub };
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
