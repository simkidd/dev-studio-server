import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";

const startServer = async () => {
  try {
    if (ENV.MONGO_URI) {
      await connectDB();
    } else {
      logger.warn("MONGO_URI not defined in environment variables. Starting server without active DB connection.");
    }

    const server = app.listen(ENV.PORT, () => {
      logger.info(`🚀 Server running in ${ENV.NODE_ENV} mode on http://localhost:${ENV.PORT}`);
      logger.info(`📡 API Endpoints available at: http://localhost:${ENV.PORT}${ENV.API_PREFIX}`);
      logger.info(`🩺 Health check: http://localhost:${ENV.PORT}/health`);
    });

    const shutdown = () => {
      logger.info("Closing HTTP server...");

      server.close(() => {
        logger.info("HTTP server closed.");
        disconnectDB()
          .catch((err) => {
            logger.error("Error disconnecting from database:", err);
          })
          .finally(() => {
            logger.info("Exiting process.");
            process.exit(0);
          });
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error("Server did not shut down in time. Exiting forcefully.");
        process.exit(1);
      }, 10000).unref();
    };

    // Graceful shutdown
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection at: ", reason);
      shutdown();
    });
  } catch (error) {
    console.error("[Server Start Error] Fatal error starting server:", error);
    process.exit(1);
  }
};

startServer();
