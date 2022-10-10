import { Database, DatabaseConfig } from 'aloedb';
import { resolve } from 'path';
import { User } from '../resolvers/users/mod.ts';
import { Task } from '../resolvers/tasks/mod.ts';

type Storage = {
  users: Database<User>;
  tasks: Database<Task>;
  posts: Database;
  settings: Database;
};

type StorageOptions = Partial<DatabaseConfig & {}>;

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
      path: resolve(dir, 'users.json'),
    }),
    tasks: new Database({
      ...options,
      autosave: true,
      optimize: true,
      pretty: false,
      path: resolve(dir, 'tasks.json'),
    }),
    posts: new Database({
      ...options,
      autosave: true,
      optimize: true,
      pretty: false,
      path: resolve(dir, 'posts.json'),
    }),
    settings: new Database({
      ...options,
      autosave: true,
      optimize: true,
      pretty: false,
      path: resolve(dir, 'settings.json'),
    }),
  };

  if (autoload) {
    await Promise.all(Object.entries(storage).map(([_, v]) => v.load()));
  }

  return storage;
};
