import { crypto } from 'https://deno.land/std@0.159.0/crypto/mod.ts';
import { bufferToHex } from 'hextools';
import { z } from 'zod';
import { nanoid } from 'nanoid';

import { config } from '../../mod.ts';
import { createToken } from '../../setup/jwt.ts';
import { storage } from '../../setup/storage.ts';
import * as jsend from '../../utils/jsend.ts';
import { RouteHandler } from '../../utils/types.ts';
import { UserRole } from './mod.ts';

export const login: RouteHandler = async ({ raw }, h) => {
  let data;

  try {
    data = await raw.json();
  } catch (_) {
    return jsend.error('Input values should be JSON.');
  }

  const schema = z.object({
    email: z.string().email().transform((v) => v.trim()),
    password: z.string(),
  });

  const result = await schema.safeParseAsync(data);

  if (!result.success) return jsend.zodFail(result);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(result.data.password),
    { name: 'PBKDF2' },
    false,
    [
      'deriveBits',
    ],
  );

  const hash = await crypto.subtle.deriveBits(
    {
      iterations: 30,
      hash: 'SHA-512',
      name: 'PBKDF2',
      salt: new TextEncoder().encode(config.salt),
    },
    key,
    128,
  );

  const user = await storage.users.findOne({
    email: data.email,
    password: bufferToHex(hash),
  });

  if (!user) {
    return jsend.fail<typeof schema._type>({
      email: 'User has not been found',
    });
  }

  const token = await createToken({
    sub: user.id,
  }, config.sessionAge);
  return h.response(jsend.success()).state('token', {
    value: token,
    secure: config.secure,
    maxAge: config.sessionAge / 1000,
  });
};

export const register: RouteHandler = async ({ raw }, h) => {
  const data = await raw.json();
  const schema = z.object({
    email: z.string().email().transform((v) => v.trim()),
    nickname: z.string().transform((v) => v.trim()),
    password: z.string(),
    password2: z.string(),
  }).refine((data) => data.password === data.password2, {
    message: 'Passwords don\'t match',
    path: ['password2'],
  });

  const result = await schema.safeParseAsync(data);

  if (!result.success) return jsend.zodFail(result);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(result.data.password),
    { name: 'PBKDF2' },
    false,
    [
      'deriveBits',
    ],
  );

  const hash = await crypto.subtle.deriveBits(
    {
      iterations: 30,
      hash: 'SHA-512',
      name: 'PBKDF2',
      salt: new TextEncoder().encode(config.salt),
    },
    key,
    128,
  );

  let isEmail = false;
  let isNickname = false;
  let user = await storage.users.findOne((doc) => {
    if (doc.email == result.data.email) isEmail = true;
    if (doc.nickname == result.data.nickname) isNickname = true;
    if (isEmail || isNickname) return true;
    return false;
  });

  if (user) {
    return jsend.fail<z.infer<typeof schema>>({
      email: isEmail ? 'User with such email already exists' : undefined,
      nickname: isNickname
        ? 'User with such nickname already exists'
        : undefined,
    });
  }

  user = await storage.users.insertOne({
    id: await nanoid(10),
    nickname: result.data.nickname,
    email: result.data.email,
    password: bufferToHex(hash),
    role: UserRole.USER,
    registered: Date.now(),
  });

  if (!user) return jsend.error('User could not be created.');

  const token = await createToken({
    sub: user.id,
  }, config.sessionAge);
  return h.response(jsend.success(user)).state('token', {
    value: token,
    secure: config.secure,
    maxAge: config.sessionAge / 1000,
  });
};
