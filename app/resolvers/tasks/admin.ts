import { z } from 'zod';
import { resolve } from 'path';
import { nanoid } from 'nanoid';

import { InputType, useRoute } from '../../utils/pogo-resolver/mod.ts';
import { storage } from '../../setup/storage.ts';
import { config } from '../../mod.ts';
import { authorized } from '../../rules/auth.ts';
import { UserRole } from '../users/mod.ts';
import { createPbkdf2Hash } from '../../setup/crypto.ts';

export const createTask = useRoute({
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
      } catch (e) {
        console.log(e);
        return res.error('File could not be uploaded on server.');
      }
    }

    const hashFlag = await createPbkdf2Hash(input.flag, config.salt);

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

    return {
      id: task.id,
      name: task.name,
      content: task.content,
      tags: task.tags,
      created: task.created,
      filePath: task.filePath,
    };
  },
});

export const deleteTask = useRoute({
  rules: [authorized({ role: UserRole.ADMIN })],
  schema: z.object({ id: z.string() }),
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
