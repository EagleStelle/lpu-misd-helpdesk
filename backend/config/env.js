import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourceRoot = path.resolve(__dirname, "..", "..");
const appRoot = path.resolve(__dirname, "..");
const hasSourceRootPackage = fs.existsSync(path.join(sourceRoot, "package.json"));

export const rootEnvPath = path.join(
  hasSourceRootPackage ? sourceRoot : appRoot,
  ".env",
);

dotenv.config({ path: rootEnvPath });
