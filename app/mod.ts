import pogo from 'pogo';

import { defineStorage } from './setup/storage.ts';
import { defineSecret } from './setup/jwt.ts';
import { authorized } from './utils/mod.ts';
import { login, profile, register, UserRole } from './resolvers/users/mod.ts';
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

  server.router.get(`/files/{file*}`, (_, h) => h.directory(config.publicDir));

  server.router.post(
    '/login',
    authorized(login, { shouldBeAuthorized: false }),
  );
  server.router.post(
    '/register',
    authorized(register, { shouldBeAuthorized: false }),
  );
  server.router.get('/profile', authorized(profile));
  server.router.get('/task', authorized(task));
  server.router.get('/tasks', authorized(tasks));
  server.router.post(
    '/admin/task',
    authorized(admin.createTask, { role: UserRole.ADMIN }),
  );
  server.router.post(
    '/admin/deleteTask',
    authorized(admin.deleteTask, { role: UserRole.ADMIN }),
  );

  console.log(`Server is started on "http://localhost:${port}" c:`);
  await server.start();
};
