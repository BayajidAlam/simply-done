import { Response } from 'express';

// Simple response functions
export const success = (res: Response, message: string, data?: any, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    ...(data && { data })
  });
};

export const error = (res: Response, message: string, status = 500) => {
  return res.status(status).json({
    error: true,
    message
  });
};

// Quick shortcuts for common responses
export const created = (res: Response, message: string, data?: any) => success(res, message, data, 201);
export const badRequest = (res: Response, message: string) => error(res, message, 400);
export const notFound = (res: Response, message: string) => error(res, message, 404);
export const unauthorized = (res: Response, message: string) => error(res, message, 401);
export const conflict = (res: Response, message: string) => error(res, message, 409);