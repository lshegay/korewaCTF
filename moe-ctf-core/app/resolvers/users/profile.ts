import { authorized } from '../../rules/auth.ts';
import { manipulator } from '../../setup/manipulator.ts';

export const profile = manipulator.useRoute({
  rules: [authorized()],
  resolve: ({ req: { user }, res }) => {
    if (!user) return res.error('Something happened on server.');

    return res.success({
      id: user.id,
      email: user.email,
      content: user.content,
      nickname: user.nickname,
      role: user.role,
      registered: user.registered,
    });
  },
});
