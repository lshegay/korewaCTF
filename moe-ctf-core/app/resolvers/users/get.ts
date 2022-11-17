import { z } from 'zod';

import { UserRole } from './mod.ts';
import { authorized } from '../../rules/auth.ts';
import { storage } from '../../setup/storage.ts';
import { manipulator } from '../../setup/manipulator.ts';

export const users = manipulator.useRoute({
  url: '/users',
  rules: [authorized({ role: UserRole.ADMIN })],
  schema: z.object({
    page: z.number().min(1).optional(),
    limit: z.number().min(1).optional(),
  }),
  resolve: async ({ res, input }) => {
    const page = input.page ?? 1;
    const limit = input.limit ?? 100;

    const result = (await storage.users.findMany()).slice(
      (page - 1) * limit,
      (page - 1) * limit + limit,
    ).map((v) => ({ ...v, password: undefined }));

    return res.success({ users: result });
  },
});
