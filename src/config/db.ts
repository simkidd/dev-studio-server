import dns from "node:dns";
import mongoose from "mongoose";
import { ENV } from "./env";

// Ensure Node DNS resolver uses public DNS in local environments to prevent querySrv ECONNREFUSED
if (!ENV.IS_PROD) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  } catch {
    // Ignore in environments where setting DNS is restricted
  }
}

// Global connection promise cache for serverless environments (e.g. Vercel / AWS Lambda)
let cachedConnection: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  // If already connected, return existing mongoose instance
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If a connection attempt is already in progress, reuse the existing promise
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!ENV.MONGO_URI) {
    throw new Error("[Database Error] MONGO_URI is not defined in environment variables.");
  }

  cachedConnection = mongoose
    .connect(ENV.MONGO_URI, {
      dbName: ENV.DB_NAME,
      bufferCommands: false, // Do not hang operations for 10s if disconnected
      serverSelectionTimeoutMS: 5000, // Fail fast after 5s if Atlas is unreachable
    })
    .then((conn) => {
      console.log(
        `[Database] MongoDB Connected [${ENV.NODE_ENV}]: ${conn.connection.host}/${conn.connection.name}`,
      );
      return conn;
    })
    .catch((error) => {
      cachedConnection = null;
      console.error(`[Database Error] Connection failed:`, error);
      throw error;
    });

  return cachedConnection;
};

export const disconnectDB = async (): Promise<void> => {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
};

