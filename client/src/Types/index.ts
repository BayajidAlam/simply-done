export interface IUser {
  email: string;
  userName: string;
}
export interface ITodoTypes {
  id: string;
  text: string;
  isCompleted: boolean;
}

export enum NoteStatus {
  ACTIVE = "active",
  ARCHIVED = "archived", 
  TRASHED = "trashed"
}

export interface INoteTypes {
  _id: string;
  title: string;
  content: string;
  isTodo: boolean;
  email: string;
  todos?: ITodoTypes[];
  status: NoteStatus;
  createdAt: Date;
  updatedAt?: Date;
}