import ServerRequest from 'https://deno.land/x/pogo@v0.6.0/lib/request.ts';
import { RouteHandlerResult } from 'https://deno.land/x/pogo@v0.6.0/lib/types.ts';
import { Toolkit } from 'pogo';

import { User } from '../resolvers/users/mod.ts';

export type RouteHandler = (
  request: ServerRequest & { user?: User },
  h: Toolkit,
) => RouteHandlerResult;
