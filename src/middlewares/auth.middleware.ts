import { Request, Response, NextFunction } from "express";
import { AuthService, ITokenPayload } from "../services";
import { sendError } from "../utils/api-response";

export interface AuthRequest extends Request {
  user?: ITokenPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Authentication required. Please provide a valid token.", 401);
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      sendError(res, "Authentication required. Malformed authorization header.", 401);
      return;
    }

    const decoded = AuthService.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      sendError(res, "Token expired. Please refresh your session.", 401);
      return;
    }
    sendError(res, "Invalid token. Authentication failed.", 401);
  }
};

export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user || req.user.role !== "superadmin") {
    sendError(res, "Access denied. Superadmin privileges required.", 403);
    return;
  }
  next();
};
