// server/src/types.ts
import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  userName: string;
  email: string;
  password: string;
  createdAt?: Date;
}

export interface Note {
  _id?: ObjectId;
  title: string;
  content: string;
  isArchived: boolean;
  isTrashed: boolean;
  email: string;
  isTodo: boolean | null;
  todos: Array<{
    id: string;
    text: string;
    isCompleted: boolean;
  }>;
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