import { verifyToken } from '../setup/jwt.ts';
import { storage } from '../setup/storage.ts';
import { UserRole } from '../resolvers/users/mod.ts';
import { useRule } from '../utils/pogo-resolver/mod.ts';
import { parseAuthHeader } from '../utils/jwt/mod.ts';

export type AuthorizedOptions = {
  shouldBeAuthorized: boolean;
  role: UserRole;
};

/**
 * Addes user JWT authentication support.
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

    // const { token } = req.state;

    if (shouldBeAuthorized) {
      const authorization = req.headers.get('authorization');
      if (!authorization) {
        return res.fail({ user: 'No authorization token.' });
      }

      const params = parseAuthHeader(authorization);
      if (!params || params.scheme.toLowerCase() != 'bearer') {
        return res.fail({
          user: 'Authorization token should be bearer (JWT) type.',
        });
      }
      const { value: token } = params;

      const payload = token ? (await verifyToken(token)) : null;

      if (!payload?.sub) {
        return res.fail({ user: 'User should be authorized.' });
      }

      const result = await storage.users.findOne({ id: payload.sub });
      if (!result) return res.error('Something happened on server.');

      if (result.role < role) {
        return res.fail({ user: 'User has not privileges to do that.' });
      }

      req.user = result;
    }
  },
});
