import { authorized } from '../../rules/auth.ts';
import { manipulator } from '../../setup/manipulator.ts';
import { config } from '../../mod.ts';

export const files = manipulator.useRoute({
  url: '/files/{file*}',
  rules: [authorized()],
  resolve: async ({ h, req }) => {
    // TODO: change response stuff
    req.response.body = (await h.directory(config.publicDir)).body;
    return req.response;
  },
});
