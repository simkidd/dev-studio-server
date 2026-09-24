import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const defaultDbName = isProduction ? "" : "";
const dbName = process.env.DB_NAME || "";

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: nodeEnv,
  IS_PROD: isProduction,
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  DB_NAME: dbName,
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  BREVO_API_KEY: process.env.BREVO_API_KEY || "",
  BREVO_FROM_NAME: process.env.BREVO_FROM_NAME || "",
  BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL || "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
};
