import pogo from 'pogo';

import { defineStorage } from './setup/storage.ts';
import { defineSecret } from './setup/jwt.ts';
import { login, profile, register } from './resolvers/users/mod.ts';
import { admin, task, tasks } from './resolvers/tasks/mod.ts';

type ApplicationOptions = {
  moeDir: string;
  storageDir: string;
  publicDir: string;
  sessionAge: number;
  salt: string;
  secure: boolean;
  maxPoints: number;
};
export let config!: ApplicationOptions;

export default async (
  port = 4000,
  options: ApplicationOptions = {
    moeDir: './.moe',
    storageDir: './storage',
    publicDir: './public',
    sessionAge: 604800000, // week in ms
    salt: 'should_be_changed!',
    secure: false,
    maxPoints: 500,
  },
) => {
  config = options;

  await defineSecret(config.moeDir);
  await defineStorage(true, config.storageDir);

  const server = pogo.server({ port });
  const router = server.router;

  router.get(`/files/{file*}`, (_, h) => h.directory(config.publicDir));

  router.post('/login', login);
  router.post('/register', register);
  router.get('/profile', profile);

  router.get('/task', task);
  router.get('/tasks', tasks);

  router.post('/admin/task', admin.createTask);
  server.router.post('/admin/deleteTask', admin.deleteTask);

  console.log(`Server is started on "http://localhost:${port}" c:`);
  await server.start();
};
