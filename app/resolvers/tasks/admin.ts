import { z } from 'zod';
import { bufferToHex } from 'hextools';
import { resolve } from 'path';
import { nanoid } from 'nanoid';

import { RouteHandler } from '../../utils/types.ts';
import { formDataToObject } from 'form_data_to_object';
import * as jsend from '../../utils/jsend.ts';
import { storage } from '../../setup/storage.ts';
import { config } from '../../mod.ts';

export const createTask: RouteHandler = async ({ raw }) => {
  let data;

  try {
    const formData = await raw.formData();
    data = formDataToObject(formData);
  } catch (_) {
    return jsend.error('Input values should be JSON.');
  }

  const schema = z.object({
    name: z.string().transform((v) => v.trim()),
    content: z.string(),
    tags: z.array(z.string()).default([]).transform((v) => v.map((tag) => tag.trim())),
    file: z.instanceof(File).optional(),
    flag: z.string().transform((v) => v.trim()),
  });

  const result = await schema.safeParseAsync(data);
  if (!result.success) return jsend.zodFail(result);

  const taskId = await nanoid(10);
  let fileName: string | undefined = undefined;

  if (result.data.file) {
    fileName = `${taskId}__${result.data.file.name}`;

    try {
      await Deno.stat(config.publicDir);
    } catch (_) {
      // dir folder is not exist
      Deno.mkdir(resolve(config.publicDir));
    }

    try {
      (async () => {
        if (!result.data.file) return;

        const file = await Deno.open(
          resolve(
            config.publicDir,
            `${taskId}__${result.data.file.name}`,
          ),
          { write: true, create: true },
        );

        await result.data.file.stream().pipeTo(file.writable);
      })();
    } catch (e) {
      console.log(e);
      return jsend.error('File could not be uploaded on server.');
    }
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(result.data.flag),
    { name: 'PBKDF2' },
    false,
    [
      'deriveBits',
    ],
  );

  const hashFlag = await crypto.subtle.deriveBits(
    {
      iterations: 30,
      hash: 'SHA-512',
      name: 'PBKDF2',
      salt: new TextEncoder().encode(config.salt),
    },
    key,
    128,
  );

  const task = await storage.tasks.insertOne({
    id: taskId,
    name: result.data.name,
    content: result.data.content,
    tags: result.data.tags,
    flag: bufferToHex(hashFlag),
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
};

export const deleteTask: RouteHandler = async ({ raw }) => {
  let data;

  try {
    data = await raw.json();
  } catch (_) {
    return jsend.error('Input values should be JSON.');
  }

  const schema = z.object({
    id: z.string(),
  });

  const result = await schema.safeParseAsync(data);
  if (!result.success) return jsend.zodFail(result);

  const task = await storage.tasks.deleteOne({ id: result.data.id });
  if (!task) return jsend.fail({ id: `No Task with such id "${result.data.id}".` });
  
  if (task.filePath) {
    try {
      Deno.remove(resolve(config.publicDir, task.filePath.replace('/files/', '')));
    } catch (_) {
      // nothing happens then
    }
  }

  return jsend.success({ id: 'Task was removed.' });
};