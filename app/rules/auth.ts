import { verifyToken } from '../setup/jwt.ts';
import { storage } from '../setup/storage.ts';
import { UserRole } from '../resolvers/users/mod.ts';
import { useRule } from '../utils/pogo-resolver/mod.ts';

export type AuthorizedOptions = {
  shouldBeAuthorized: boolean;
  role: UserRole;
};

/**
 * Addes user authentication support.
 * @param options.role minimum user role to success.
 * @param options.shouldBeAuthorized if true then user must be authorized else user must not be authorized.
 */
export const authorized = useRule<Partial<AuthorizedOptions>>({
  resolve: async ({ req, res, options }) => {
    const { shouldBeAuthorized, role } = {
      shouldBeAuthorized: true,
      role: UserRole.USER,
      ...options,
    };

    const { token } = req.state;
    const payload = token ? (await verifyToken(token)) : null;

    if (shouldBeAuthorized) {
      if (!payload?.sub) {
        return { res: res.fail({ user: 'User should be authorized.' }) };
      }

      const result = await storage.users.findOne({ id: payload.sub });
      if (!result) return { res: res.error('Something happened on server.') };

      if (result.role < role) {
        return {
          res: res.fail({ user: 'User has not privileges to do that.' }),
        };
      }

      req.user = result;
    } else {
      if (payload) {
        return { res: res.fail({ user: 'User should not be authorized.' }) };
      }
    }

    return { req };
  },
});
