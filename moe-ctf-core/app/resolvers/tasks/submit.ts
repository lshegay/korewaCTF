import { z } from 'zod';
import { authorized } from '../../rules/auth.ts';
import { createPbkdf2Hash } from '../../setup/crypto.ts';
import { storage } from '../../setup/storage.ts';
import { manipulator } from '../../setup/manipulator.ts';
import { UserRole } from '../users/mod.ts';

export const submit = manipulator.useRoute({
  method: 'POST',
  rules: [authorized()],
  schema: z.object({
    id: z.string(),
    flag: z.string().transform((v) => v.trim()),
  }),
  resolve: async ({ req, res, input }) => {
    const taskId = input.id;

    if ((req.user?.role as UserRole) > UserRole.USER) {
      return res.fail({ flag: 'Admins can\'t submit flags.' });
    }

    const result = await storage.tasks.findOne({ id: taskId });
    if (!result) return res.fail({ id: `No such task with id ${taskId}` });

    if (result.solved[req.user?.id as string]) {
      return res.fail({ flag: 'User already submitted flag.' });
    }

    const hashFlag = await createPbkdf2Hash(input.flag);

    if (result.flag != hashFlag) {
      return res.fail({ flag: 'Flag is not right.' });
    }

    await storage.tasks.updateOne({ id: taskId }, {
      solved: {
        ...result.solved,
        [req.user?.id as string]: {
          nickname: (req.user?.nickname as string),
          date: Date.now(),
        },
      },
    });

    return res.success({ flag: 'Flag is submitted.' });
  },
});
