import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { sendError } from "../utils/api-response";
import { logger } from "../utils/logger";
import { ENV } from "../config/env";

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Cannot ${req.method} ${req.originalUrl} - Route not found`, 404);
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for '${field}'. Please use another value.`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const validationErrors = Object.values(err.errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    sendError(res, "Validation Error", statusCode, validationErrors);
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for parameter: ${err.path}`;
  }

  if (statusCode >= 500) {
    logger.error(`[Unhandled Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  sendError(
    res,
    message,
    statusCode,
    ENV.NODE_ENV === "development" ? { stack: err.stack } : undefined,
  );
};
