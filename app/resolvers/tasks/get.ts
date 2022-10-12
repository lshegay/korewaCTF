import { z } from 'zod';
import { authorized } from '../../rules/auth.ts';
import { storage } from '../../setup/storage.ts';
import { InputType, useRoute } from '../../utils/pogo-resolver/mod.ts';

export const task = useRoute({
  rules: [authorized()],
  schema: z.object({
    id: z.string(),
  }),
  type: InputType.PARAMS,
  resolve: async ({ res, input }) => {
    const taskId = input.id;

    const result = await storage.tasks.findOne({ id: taskId });
    if (!result) return res.fail({ id: `No such task with id ${taskId}` });

    return res.success(result);
  },
});

export const tasks = useRoute({
  rules: [authorized()],
  schema: z.object({
    page: z.number().min(1).optional(),
    limit: z.number().min(1).optional(),
  }),
  type: InputType.PARAMS,
  resolve: async ({ res, input }) => {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;

    const result = (await storage.tasks.findMany()).slice(
      (page - 1) * limit,
      (page - 1) * limit + limit,
    );

    return res.success({ tasks: result });
  },
});
