import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const CLERK_PEM_PUBLIC_KEY = process.env.CLERK_PEM_PUBLIC_KEY;

export function clerkAuthMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  const token = auth.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, CLERK_PEM_PUBLIC_KEY, {
      algorithms: ["RS256"],
    });
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
