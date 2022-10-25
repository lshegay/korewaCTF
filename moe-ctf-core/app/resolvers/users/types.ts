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