import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";
dotenv.config();

const requiredEnvVariables = [
  "PORT",
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
//   "CLIENT_URL"
] as const;

requiredEnvVariables.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}`
    );
  }
});

export const env = {
  PORT: process.env.PORT!,
  DATABASE_URL:process.env.MONGO_URI!,
  NODE_ENV: process.env.NODE_ENV || "development",
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET!,
  ACCESS_TOKEN_EXPIRES_IN: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as NonNullable<SignOptions["expiresIn"]>,
  REFRESH_TOKEN_EXPIRES_IN: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as NonNullable<SignOptions["expiresIn"]>,
  CLIENT_URL: process.env.CLIENT_URL!
};