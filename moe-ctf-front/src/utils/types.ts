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
  score?: number;
  tags: string[];
  solved: TaskSolved;
  isSolved?: boolean;
};

export type Post = {
  id: string;
  name: string;
  created: number;
  content: string;
};

export type ScoreboardUser = {
  id: string;
  nickname: string;
  taskCount: number;
  score: number;
  date: number;
};

export type Scoreboard = [string, ScoreboardUser][];


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

