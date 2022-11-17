import pogo from 'pogo';

import { defineStorage } from './setup/storage.ts';
import { defineSecret } from './setup/jwt.ts';
import { defineSalt } from './setup/crypto.ts';
import { manipulator } from './setup/manipulator.ts';
import { cors } from './rules/cors.ts';

import './resolvers/mod.ts';

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

  manipulator.attach(router);
  manipulator.middlewares.push(cors({
    exposedHeaders: ['Authorization'],
    origin: ['http://localhost:3000'],
  }));

  console.log(`Server is started on "http://localhost:${port}" c:`);
  await server.start();
};
