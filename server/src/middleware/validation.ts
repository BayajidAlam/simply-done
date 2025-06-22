import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { userName, email, password } = req.body;
  
  if (!userName || !email || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      message: "userName, email, and password are required"
    });
    return;
  }
  
  if (!emailRegex.test(email)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      message: "Valid email required"
    });
    return;
  }
  
  if (password.length < 6) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      message: "Password must be at least 6 characters"
    });
    return;
  }
  
  req.body.email = email.toLowerCase().trim();
  req.body.userName = userName.trim();
  
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      message: "Email and password are required"
    });
    return;
  }
  
  if (!emailRegex.test(email)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      message: "Valid email required"
    });
    return;
  }
  
  req.body.email = email.toLowerCase().trim();
  next();
};