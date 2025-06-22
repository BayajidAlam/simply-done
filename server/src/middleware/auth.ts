// server/middleware/auth.ts
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { config } from "../config";

interface JwtPayload {
  email: string;
  userId: string;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: true,
      message: "Access token required"
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: true,
      message: "Invalid token"
    });
    return;
  }
};

export type { AuthRequest };