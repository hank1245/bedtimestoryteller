import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const configDir = path.dirname(__filename);
const backendRoot = path.resolve(configDir, "..");

const isProductionEnv = () => process.env.NODE_ENV === "production";

export const getStorageRoot = () =>
  isProductionEnv() ? "/app/data" : backendRoot;

export const getUploadsDir = () => path.join(getStorageRoot(), "uploads");

export const ensureStorageDirectories = () => {
  const storageRoot = getStorageRoot();
  const uploadsDir = getUploadsDir();

  if (isProductionEnv() && !fs.existsSync(storageRoot)) {
    fs.mkdirSync(storageRoot, { recursive: true });
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

export const resolveStoragePath = (relativePath = "") =>
  path.join(getStorageRoot(), relativePath);

export const removeStoredFile = (relativePath) => {
  if (!relativePath) return;

  const filePath = resolveStoragePath(relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
