import { lessThanOrEqual } from 'aloedb';
import { config } from '../../mod.ts';
import { authorized } from '../../rules/auth.ts';
import { storage } from '../../setup/storage.ts';
import { manipulator } from '../../setup/manipulator.ts';
import { UserRole } from '../users/mod.ts';

export const scoreboard = manipulator.useRoute({
  rules: [authorized()],
  resolve: async ({ res }) => {
    const users = await storage.users.findMany({
      role: lessThanOrEqual(UserRole.USER),
    });
    const tasks = await storage.tasks.findMany();

    const scoreboard = new Map(users.map((user) => [user.id, {
      id: user.id,
      nickname: user.nickname,
      taskCount: 0,
      score: 0,
      date: 0,
    }]));

    tasks.forEach((task) => {
      const solved = new Map(Object.entries(task.solved));

      solved.forEach(({ date }, userId) => {
        const user = scoreboard.get(userId);
        if (!user) return;

        user.taskCount += 1;
        user.date += date;
        /**
         * 1/5 * base + 4/5 * base * (0.925)^(n - 1), where
            base — is a base score for a challenge (500 for the most of challenges),
            n — is a number of teams that solved the challenge
         */
        user.score += Math.round(
          (config.maxPoints * 1 / 5 +
            4 / 5 * config.maxPoints * 0.925 ** (solved.size - 1)) * 100,
        ) / 100;
      });
    });

    const scoreboardArray = Array.from(scoreboard)
      .sort(([_1, u1], [_2, u2]) => u1.score - u2.score);

    return res.success({ scoreboard: scoreboardArray });
  },
});
