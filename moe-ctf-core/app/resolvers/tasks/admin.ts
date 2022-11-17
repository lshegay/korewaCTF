import { filterValues } from 'https://deno.land/std@0.159.0/collections/filter_values.ts';
import { z } from 'zod';
import { resolve } from 'path';
import { nanoid } from 'nanoid';

import { InputType } from '../../utils/pogo-resolver/mod.ts';
import { manipulator } from '../../setup/manipulator.ts';
import { storage } from '../../setup/storage.ts';
import { config } from '../../mod.ts';
import { authorized } from '../../rules/auth.ts';
import { UserRole } from '../users/mod.ts';
import { createPbkdf2Hash } from '../../setup/crypto.ts';

export const createTask = manipulator.useRoute({
  url: '/admin/task',
  method: 'POST',
  rules: [authorized({ role: UserRole.ADMIN })],
  schema: z.object({
    name: z.string().transform((v) => v.trim()),
    content: z.string(),
    tags: z.array(z.string()).default([]).transform((v) =>
      v.map((tag) => tag.trim())
    ),
    file: z.instanceof(File).optional(),
    flag: z.string().transform((v) => v.trim()),
  }),
  type: InputType.FORM_DATA,
  resolve: async ({ input, res }) => {
    const taskId = await nanoid(10);
    let fileName: string | undefined = undefined;

    if (input.file) {
      fileName = `${taskId}__${input.file.name}`;

      try {
        await Deno.stat(config.publicDir);
      } catch (_) {
        // dir folder is not exist
        Deno.mkdir(resolve(config.publicDir));
      }

      try {
        const file = await Deno.open(
          resolve(
            config.publicDir,
            `${taskId}__${input.file.name}`,
          ),
          { write: true, create: true },
        );

        await input.file.stream().pipeTo(file.writable);
      } catch (_) {
        return res.error('File could not be uploaded on server.');
      }
    }

    const hashFlag = await createPbkdf2Hash(input.flag);

    const task = await storage.tasks.insertOne({
      id: taskId,
      name: input.name,
      content: input.content,
      tags: input.tags ?? [],
      flag: hashFlag,
      created: Date.now(),
      solved: {},
      filePath: fileName ? `/files/${fileName}` : undefined,
    });

    return res.success({
      id: task.id,
      name: task.name,
      content: task.content,
      tags: task.tags,
      created: task.created,
      filePath: task.filePath,
    });
  },
});

export const updateTask = manipulator.useRoute({
  url: '/admin/updateTask',
  method: 'POST',
  rules: [authorized({ role: UserRole.ADMIN })],
  schema: z.object({
    id: z.string(),
    name: z.string().optional().transform((v) => v?.trim()),
    content: z.string().optional(),
    tags: z.array(z.string()).optional().transform((v) =>
      v?.map((tag) => tag.trim())
    ),
    file: z.instanceof(File).optional(),
    flag: z.string().optional().transform((v) => v?.trim()),
  }),
  type: InputType.FORM_DATA,
  resolve: async ({ input, res }) => {
    const taskId = input.id;
    let fileName: string | undefined = undefined;

    if (input.file) {
      fileName = `${taskId}__${input.file.name}`;

      try {
        await Deno.stat(config.publicDir);
      } catch (_) {
        // dir folder is not exist
        Deno.mkdir(resolve(config.publicDir));
      }

      try {
        for await (const file of Deno.readDir(config.publicDir)) {
          if (!file.name.includes(taskId)) continue;
          await Deno.remove(resolve(config.publicDir, file.name));
        }
      } catch (_) {
        // nothing happens here
      }

      try {
        const file = await Deno.open(
          resolve(
            config.publicDir,
            `${taskId}__${input.file.name}`,
          ),
          { write: true, create: true },
        );

        await input.file.stream().pipeTo(file.writable);
      } catch (_) {
        return res.error('File could not be uploaded on server.');
      }
    }

    const task = await storage.tasks.updateOne(
      { id: taskId },
      filterValues({
        name: input.name,
        content: input.content,
        tags: input.tags,
        flag: input.flag && await createPbkdf2Hash(input.flag),
        filePath: fileName ? `/files/${fileName}` : undefined,
      }, (v) => typeof v != 'undefined'),
    );

    if (!task) return res.fail({ id: 'Nothing has changed.' });

    return res.success({
      id: task.id,
      name: task.name,
      content: task.content,
      tags: task.tags,
      created: task.created,
      filePath: task.filePath,
    });
  },
});

export const deleteTask = manipulator.useRoute({
  url: '/admin/deleteTask',
  method: 'POST',
  rules: [authorized({ role: UserRole.ADMIN })],
  schema: z.object({ id: z.string() }),
  type: InputType.JSON,
  resolve: async ({ input, res }) => {
    const task = await storage.tasks.deleteOne({ id: input.id });
    if (!task) {
      return res.fail({ id: `No Task with such id "${input.id}".` });
    }

    if (task.filePath) {
      try {
        Deno.remove(
          resolve(config.publicDir, task.filePath.replace('/files/', '')),
        );
      } catch (_) {
        // nothing happens then
      }
    }

    return res.success({ id: 'Task was removed.' });
  },
});
