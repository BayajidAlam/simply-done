import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  userName: string;
  email: string;
  password: string;
  createdAt?: Date;
}

export enum INoteStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  TRASHED = "trashed",
}

export interface ITodoTypes {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface INoteTypes {
  _id?: ObjectId | string;
  title: string;
  content: string;
  status: INoteStatus;
  email: string;
  isTodo: boolean;
  todos?: ITodoTypes[];
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
