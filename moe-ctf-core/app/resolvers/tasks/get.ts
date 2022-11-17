import { z } from 'zod';
import { manipulator } from '../../setup/manipulator.ts';
import { authorized } from '../../rules/auth.ts';
import { storage } from '../../setup/storage.ts';
import { UserRole } from '../users/mod.ts';

export const task = manipulator.useRoute({
  url: '/task',
  rules: [authorized()],
  schema: z.object({
    id: z.string(),
  }),
  resolve: async ({ req, res, input }) => {
    const taskId = input.id;

    const result = await storage.tasks.findOne({ id: taskId });
    if (!result) return res.fail({ id: `No such task with id ${taskId}` });

    if ((req.user?.role as UserRole) > UserRole.USER) {
      return res.success(result);
    }

    return res.success({
      ...result,
      flag: undefined,
    });
  },
});

export const tasks = manipulator.useRoute({
  url: '/tasks',
  rules: [authorized()],
  schema: z.object({
    page: z.number().min(1).optional(),
    limit: z.number().min(1).optional(),
  }),
  resolve: async ({ req, res, input }) => {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;

    const result = (await storage.tasks.findMany()).slice(
      (page - 1) * limit,
      (page - 1) * limit + limit,
    );

    if ((req.user?.role as UserRole) > UserRole.USER) {
      return res.success({ tasks: result });
    }

    return res.success({
      tasks: result.map((v) => ({ ...v, flag: undefined })),
    });
  },
});
