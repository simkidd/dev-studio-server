import dns from "node:dns";
import mongoose from "mongoose";
import { ENV } from "./env";

// Ensure Node DNS resolver uses public DNS to prevent querySrv ECONNREFUSED on local routers/ISPs
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignore in environments where setting DNS is restricted
}

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      dbName: ENV.DB_NAME,
    });
    console.log(
      `[Database] MongoDB Connected [${ENV.NODE_ENV}]: ${conn.connection.host}/${conn.connection.name}`,
    );
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed:`, error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
