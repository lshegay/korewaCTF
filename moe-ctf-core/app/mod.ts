import pogo from 'pogo';

import { defineStorage } from './setup/storage.ts';
import { defineSecret } from './setup/jwt.ts';
import { defineSalt } from './setup/crypto.ts';
import { login, profile, register, users } from './resolvers/users/mod.ts';
import { scoreboard } from './resolvers/score/mod.ts';
import { admin, submit, task, tasks } from './resolvers/tasks/mod.ts';
import { admin as postAdmin, post, posts } from './resolvers/posts/mod.ts';
import { cors } from './rules/cors.ts';
import { manipulator } from './setup/manipulator.ts';

type ApplicationOptions = {
  moeDir: string;
  storageDir: string;
  publicDir: string;
  sessionAge: number; // ms
  secure: boolean;
  maxPoints: number;
  start?: number; // ms
  finish?: number; // ms
  cors?: string[];
};
export let config!: ApplicationOptions;

export default async (
  port = 4000,
  options: ApplicationOptions = {
    moeDir: './.moe',
    storageDir: './storage',
    publicDir: './public',
    sessionAge: 604800000, // week in ms
    secure: false,
    maxPoints: 500,
  },
) => {
  config = options;

  await defineSecret(config.moeDir);
  await defineSalt(config.moeDir);
  await defineStorage(true, config.storageDir);

  const server = pogo.server({ port });
  const router = server.router;

  manipulator.middlewares.push(cors({
    exposedHeaders: ['Authorization'],
    origin: ['http://localhost:3000']
  }));

  // TODO: authorization
  router.get(`/files/{file*}`, (_, h) => h.directory(config.publicDir));

  router.all('/login', login);
  router.all('/register', register);
  router.all('/profile', profile);
  router.all('/users', users);
  router.all('/scoreboard', scoreboard);

  router.all('/task', task);
  router.all('/tasks', tasks);
  router.all('/submit', submit);
  router.all('/admin/task', admin.createTask);
  router.all('/admin/deleteTask', admin.deleteTask);
  router.all('/admin/updateTask', admin.updateTask);

  router.all('/post', post);
  router.all('/posts', posts);
  router.all('/admin/post', postAdmin.createPost);
  router.all('/admin/deletePost', postAdmin.deletePost);
  router.all('/admin/updatePost', postAdmin.updatePost);

  console.log(`Server is started on "http://localhost:${port}" c:`);
  await server.start();
};
