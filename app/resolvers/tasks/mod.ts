export type TaskSolved = Record<string, number>; // user_id, date of resolve

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

export * from './get.ts';

import * as admin from './admin.ts';
export { admin };