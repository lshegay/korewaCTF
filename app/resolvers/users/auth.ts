import { z } from 'zod';
import { nanoid } from 'nanoid';

import { config } from '../../mod.ts';
import { createToken } from '../../setup/jwt.ts';
import { storage } from '../../setup/storage.ts';
import { UserRole } from './mod.ts';
import { useRoute } from '../../utils/pogo-resolver/mod.ts';
import { createPbkdf2Hash } from '../../setup/crypto.ts';
import { authorized } from '../../rules/auth.ts';

export const login = useRoute({
  rules: [authorized({ shouldBeAuthorized: false })],
  schema: z.object({
    email: z.string().email().transform((v: string) => v.trim()),
    password: z.string(),
  }),
  resolve: async ({ input, res }) => {
    const passwordHash = await createPbkdf2Hash(input.password, config.salt);

    const user = await storage.users.findOne({
      email: input.email,
      password: passwordHash,
    });

    if (!user) {
      return res.fail({
        email: 'User has not been found',
      });
    }

    const token = await createToken({
      sub: user.id,
    }, config.sessionAge);
    return res.success().state('token', {
      value: token,
      secure: config.secure,
      maxAge: config.sessionAge / 1000,
    });
  },
});

export const register = useRoute({
  rules: [authorized({ shouldBeAuthorized: false })],
  schema: z.object({
    email: z.string().email().transform((v) => v.trim()),
    nickname: z.string().transform((v) => v.trim()),
    password: z.string(),
    password2: z.string(),
  }).refine((data) => data.password == data.password2, {
    message: 'Passwords don\'t match',
    path: ['password2'],
  }),
  resolve: async ({ input, res }) => {
    let isEmail = false;
    let isNickname = false;
    let user = await storage.users.findOne((doc) => {
      if (doc.email == input.email) isEmail = true;
      if (doc.nickname == input.nickname) isNickname = true;
      if (isEmail || isNickname) return true;
      return false;
    });

    if (user) {
      return res.fail({
        email: isEmail ? 'User with such email already exists' : undefined,
        nickname: isNickname
          ? 'User with such nickname already exists'
          : undefined,
      });
    }

    const passwordHash = await createPbkdf2Hash(input.password, config.salt);
    user = await storage.users.insertOne({
      id: await nanoid(10),
      nickname: input.nickname,
      email: input.email,
      password: passwordHash,
      role: UserRole.USER,
      registered: Date.now(),
    });

    if (!user) return res.error('User could not be created.');

    const token = await createToken({
      sub: user.id,
    }, config.sessionAge);
    return res.success(user).state('token', {
      value: token,
      secure: config.secure,
      maxAge: config.sessionAge / 1000,
    });
  },
});
