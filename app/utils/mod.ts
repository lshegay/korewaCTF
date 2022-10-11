import { verifyToken } from '../setup/jwt.ts';
import { storage } from '../setup/storage.ts';
import { RouteHandler } from './types.ts';
import * as jsend from './jsend.ts';
import { UserRole } from '../resolvers/users/mod.ts';

export type AuthorizedOptions = {
  shouldBeAuthorized: boolean;
  role: UserRole;
};

/**
 * Addes user support.
 * @param res
 * @param options.shouldBeAuthorized if true then user must be authorized else user must not be authorized.
 * @returns resolver
 */
export const authorized = (
  res: RouteHandler,
  options?: Partial<AuthorizedOptions>,
) => {
  const resolver: RouteHandler = async (request, h) => {
    const { shouldBeAuthorized, role } = {
      shouldBeAuthorized: true,
      role: UserRole.USER,
      ...options,
    };

    const { token } = request.state;
    const payload = token ? (await verifyToken(token)) : null;

    if (shouldBeAuthorized) {
      if (!payload?.sub) {
        return jsend.fail({ user: 'User should be authorized.' });
      }

      const result = await storage.users.findOne({ id: payload.sub });
      if (!result) return jsend.error('Something happened on server.');

      if (result.role < role) {
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
