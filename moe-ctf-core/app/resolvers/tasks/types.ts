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