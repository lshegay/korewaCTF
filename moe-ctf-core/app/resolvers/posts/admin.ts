import { filterValues } from 'https://deno.land/std@0.159.0/collections/filter_values.ts';
import { z } from 'zod';
import { nanoid } from 'nanoid';

import { manipulator } from '../../setup/manipulator.ts';
import { InputType } from '../../utils/pogo-resolver/mod.ts';
import { storage } from '../../setup/storage.ts';
import { authorized } from '../../rules/auth.ts';
import { UserRole } from '../users/mod.ts';

export const createPost = manipulator.useRoute({
  url: '/admin/post',
  method: 'POST',
  rules: [authorized({ role: UserRole.ADMIN })],
  schema: z.object({
    name: z.string().transform((v) => v.trim()),
    content: z.string(),
  }),
  type: InputType.FORM_DATA,
  resolve: async ({ input, res }) => {
    const postId = await nanoid(10);

    const post = await storage.posts.insertOne({
      id: postId,
      name: input.name,
      content: input.content,
      created: Date.now(),
    });

    return res.success(post);
  },
});

export const updatePost = manipulator.useRoute({
  url: '/admin/updatePost',
  method: 'POST',
  rules: [authorized({ role: UserRole.ADMIN })],
  schema: z.object({
    id: z.string(),
    name: z.string().optional().transform((v) => v?.trim()),
    content: z.string().optional(),
  }),
  type: InputType.FORM_DATA,
  resolve: async ({ input, res }) => {
    const postId = input.id;

    const post = await storage.posts.updateOne(
      { id: postId },
      filterValues({
        name: input.name,
        content: input.content,
      }, (v) => typeof v != 'undefined'),
    );

    if (!post) return res.fail({ id: 'Nothing has changed.' });

    return res.success(post);
  },
});

export const deletePost = manipulator.useRoute({
  url: '/admin/deletePost',
  method: 'POST',
  rules: [authorized({ role: UserRole.ADMIN })],
  type: InputType.JSON,
  schema: z.object({ id: z.string() }),
  resolve: async ({ input, res }) => {
    const post = await storage.posts.deleteOne({ id: input.id });
    if (!post) {
      return res.fail({ id: `No Post with such id "${input.id}".` });
    }

    return res.success({ id: 'Post was removed.' });
  },
});
