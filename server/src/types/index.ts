// server/src/types.ts
import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  userName: string;
  email: string;
  password: string;
  createdAt?: Date;
}

export interface Todo {
  _id?: ObjectId;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse {
  error: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    userName: string;
  };
}