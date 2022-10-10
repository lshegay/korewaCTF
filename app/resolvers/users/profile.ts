import { RouteHandler } from '../../utils/types.ts';
import * as jsend from '../../utils/jsend.ts';

export const profile: RouteHandler = ({ user }) => {
  if (!user) return jsend.error('Something happened on server.');

  return jsend.success({
    id: user.id,
    email: user.email,
    content: user.content,
    nickname: user.nickname,
    role: user.role,
    registered: user.registered,
  });
};
