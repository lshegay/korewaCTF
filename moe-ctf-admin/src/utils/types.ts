export type TaskSolved = Record<string, {
  date: number;
  nickname: string;
}>; // user_id, description

export type Task = {
  id: string;
  name: string;
  created: number;
  content: string;
  flag: string;
  filePath?: string;
  tags: string[];
  solved: TaskSolved;
};

export type Post = {
  id: string;
  name: string;
  created: number;
  content: string;
};

export enum UserRole {
  GUEST = 0,
  USER = 1,
  ADMIN = 2,
}

export type User = {
  id: string;
  email: string;
  password: string;
  content?: string;
  nickname: string;
  role: UserRole;
  registered: number;
};

