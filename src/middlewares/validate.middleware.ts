import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendError } from "../utils/api-response";

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        const errors = issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join(".") : String(e.path),
          message: e.message,
        }));
        sendError(res, "Validation failed", 400, errors);
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = (await schema.parseAsync(req.query)) as any;
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        const errors = issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join(".") : String(e.path),
          message: e.message,
        }));
        sendError(res, "Query validation failed", 400, errors);
        return;
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = (await schema.parseAsync(req.params)) as any;
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        const errors = issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join(".") : String(e.path),
          message: e.message,
        }));
        sendError(res, "URL parameter validation failed", 400, errors);
        return;
      }
      next(error);
    }
  };
};
