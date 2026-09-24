// Thrown deliberately from controllers/services for expected error cases
// (not found, forbidden, bad input, etc). The centralized error handler
// middleware knows how to read `statusCode` off of this and respond
// consistently, while unexpected errors fall through as generic 500s.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;

  constructor(message: string, statusCode = 400, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    if (errorCode !== undefined) this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
