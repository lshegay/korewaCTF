import { faker } from 'npm:@faker-js/faker@^7.6.0';
import { nanoid } from 'nanoid';

import { defineStorage, storage } from './app/setup/storage.ts';
import { createPbkdf2Hash, defineSalt } from './app/setup/crypto.ts';
import { UserRole } from './app/resolvers/users/types.ts';

try {
  await Deno.stat('./storage');
  await Deno.remove('./storage', { recursive: true });
} catch (_) {
  // bruh
}

await defineSalt('./.moe');
await defineStorage(true, './storage');

const createUsers = async () => {
  const passwordHash = await createPbkdf2Hash('password');

  await storage.users.insertOne({
    id: await nanoid(10),
    nickname: 'admin',
    email: 'admin@moe.moe',
    password: await createPbkdf2Hash('password'),
    role: UserRole.ADMIN,
    registered: Date.now(),
  });

  await storage.users.insertOne({
    id: await nanoid(10),
    nickname: 'user',
    email: 'user@moe.moe',
    password: await createPbkdf2Hash('password'),
    role: UserRole.USER,
    registered: Date.now(),
  });

  for (let i = 0; i < 9; i++) {
    const nickname: string = faker.name.firstName();

    await storage.users.insertOne({
      id: await nanoid(10),
      nickname,
      email: `${nickname}@moe.moe`,
      password: passwordHash,
      role: UserRole.USER,
      registered: Date.now(),
    });
  }
};

const createPosts = async () => {
  await storage.posts.insertOne({
    id: await nanoid(10),
    name: 'Help',
    content: 'All flags are written within tasks descriptions.',
    created: Date.now() + 1000 * 60 * 60 * 24,
  });

  for (let i = 0; i < 2; i++) {
    await storage.posts.insertOne({
      id: await nanoid(10),
      name: faker.hacker.phrase(),
      content: faker.lorem.paragraphs(),
      created: Date.now(),
    });
  }
};

const createTasks = async () => {
  for (let i = 0; i < 10; i++) {
    const flag = faker.hacker.noun();

    await storage.tasks.insertOne({
      id: await nanoid(10),
      name: faker.hacker.phrase(),
      content: `${faker.lorem.paragraphs()}\n\nFlag: MOECTF{${flag}}`,
      tags: faker.helpers.arrayElements([
        'Web',
        'Crypto',
        'Reverse',
        'Misc',
        'Fun',
        'Stegano',
        'Code',
        'Anime',
      ], faker.datatype.number(2, 2, 0)),
      flag: await createPbkdf2Hash(`MOECTF{${flag}}`),
      created: faker.date.between(new Date('2022-10-01'), Date.now()).valueOf(),
      solved: {},
    });
  }
};
createUsers();
createPosts();
createTasks();
