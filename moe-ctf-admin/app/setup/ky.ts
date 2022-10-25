import f from 'ky';
import { config } from '@setup/config';

export const ky = f.create({
  prefixUrl: config.host,
});
