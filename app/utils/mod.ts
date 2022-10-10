import { verifyToken } from '../setup/jwt.ts';
import { storage } from '../setup/storage.ts';
import { RouteHandler } from './types.ts';
import * as jsend from './jsend.ts';
import { UserRole } from '../resolvers/users/mod.ts';

export const authorized = (
  res: RouteHandler,
  shouldBeAuthorized = true,
  withRole = UserRole.USER,
) => {
  const resolver: RouteHandler = async (request, h) => {
    const { token } = request.state;
    const payload = token ? (await verifyToken(token)) : null;

    if (shouldBeAuthorized) {
      if (!payload?.sub) {
        return jsend.fail({ user: 'User should be authorized.' });
      }

      const result = await storage.users.findOne({ id: payload.sub });
      if (!result) return jsend.error('Something happened on server.');

      if (result.role < withRole) {
        return jsend.fail({ user: 'User has not privileges to do that.' });
      }

      request.user = result;
    } else {
      if (payload) {
        return jsend.fail({ user: 'User should not be authorized.' });
      }
    }

    return res(request, h);
  };

  return resolver;
};
