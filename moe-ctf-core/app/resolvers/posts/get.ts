import { z } from 'zod';
import { authorized } from '../../rules/auth.ts';
import { storage } from '../../setup/storage.ts';
import { manipulator } from '../../setup/manipulator.ts';

export const post = manipulator.useRoute({
  url: '/post',
  rules: [authorized()],
  schema: z.object({
    id: z.string(),
  }),
  resolve: async ({ res, input }) => {
    const postId = input.id;

    const result = await storage.posts.findOne({ id: postId });
    if (!result) return res.fail({ id: `No such post with id ${postId}` });

    return res.success(result);
  },
});

export const posts = manipulator.useRoute({
  url: '/posts',
  rules: [authorized()],
  schema: z.object({
    page: z.number().min(1).optional(),
    limit: z.number().min(1).optional(),
  }),
  resolve: async ({ res, input }) => {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;

    const result = (await storage.posts.findMany()).slice(
      (page - 1) * limit,
      (page - 1) * limit + limit,
    );

    return res.success({ posts: result });
  },
});
