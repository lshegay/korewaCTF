import { authorized } from '../../rules/auth.ts';
import { manipulator } from '../../setup/manipulator.ts';
import { config } from '../../mod.ts';

export const post = manipulator.useRoute({
  url: '/files/{file*}',
  rules: [authorized()],
  resolve: ({ h }) => {
    return h.directory(config.publicDir);
  },
});
