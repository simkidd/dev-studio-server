import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";
import { sendSuccess } from "./utils/api-response";
import { apiRouter } from "./routes";
import { notFoundHandler, globalErrorHandler } from "./middlewares";

const app: Application = express();

// Global Middlewares
app.use(
  cors({
    origin: [ENV.CORS_ORIGIN, "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Serve local uploaded assets
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

if (!ENV.IS_PROD) {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }),
  );
}

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      status: "ok",
      system: "Developer Portfolio API",
      environment: ENV.NODE_ENV,
      database: ENV.DB_NAME,
      timestamp: new Date().toISOString(),
    },
    "API is healthy and operational",
  );
});

// Mount API v1 routes
app.use(ENV.API_PREFIX || "/api/v1", apiRouter);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
