export type ScoreboardUser = {
  id: string;
  nickname: string;
  taskCount: number;
  score: number;
  date: number;
};

export type Scoreboard = [string, ScoreboardUser][];
