export enum UserRole {
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

export * from './auth.ts';
export * from './profile.ts';
