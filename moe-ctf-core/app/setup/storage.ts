import { Database, DatabaseConfig } from 'aloedb';
import { resolve } from 'path';

import type { User } from '../resolvers/users/mod.ts';
import type { Task } from '../resolvers/tasks/mod.ts';
import type { Post } from '../resolvers/posts/types.ts';

type Storage = {
  users: Database<User>;
  tasks: Database<Task>;
  posts: Database<Post>;
  settings: Database;
};

type StorageOptions = Partial<DatabaseConfig>;

export let storage!: Storage;

export const defineStorage = async (
  autoload = true,
  dir = './storage',
  options: StorageOptions = {},
) => {
  try {
    await Deno.stat(dir);
  } catch (_) {
    // dir folder exists
    Deno.mkdir(resolve(dir));
  }

  storage = {
    users: new Database({
      ...options,
      autosave: true,
      optimize: true,
      pretty: false,
      path: `${dir}/users.json`,
    }),
    tasks: new Database({
      ...options,
      autosave: true,
      optimize: true,
      pretty: false,
      path: `${dir}/tasks.json`,
    }),
    posts: new Database({
      ...options,
      autosave: true,
      optimize: true,
      pretty: false,
      path: `${dir}/posts.json`,
    }),
    settings: new Database({
      ...options,
      autosave: true,
      optimize: true,
      pretty: false,
      path: `${dir}/settings.json`,
    }),
  };

  if (autoload) {
    await Promise.all(Object.entries(storage).map(([_, v]) => v.load()));
  }

  return storage;
};
