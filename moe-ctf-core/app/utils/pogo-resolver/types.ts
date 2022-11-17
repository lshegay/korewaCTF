import ServerRequest from 'https://deno.land/x/pogo@v0.6.0/lib/request.ts';
import { RouteHandlerResult } from 'https://deno.land/x/pogo@v0.6.0/lib/types.ts';
import ServerResponse from 'https://deno.land/x/pogo@v0.6.0/lib/response.ts';
import { Toolkit } from 'pogo';
import { z, ZodType } from 'zod';

import * as jsend from './jsend.ts';
import { InputType } from './manipulator.ts';
import { RuleHandler } from './rule.ts';
import { User } from '../../resolvers/users/mod.ts';

export type RequestDictionary = { user?: User };

export type ResolverRequest = ServerRequest & RequestDictionary;

export type RouteHandler = (
  req: ResolverRequest,
  h: Toolkit,
) => RouteHandlerResult;

export type ResolverOptions = {
  req: ResolverRequest;
  h: Toolkit;
  res: {
    success: (data?: jsend.Dictionary) => ServerResponse;
    fail: (data?: jsend.Dictionary) => ServerResponse;
    error: (
      message: string,
      data?: jsend.Dictionary,
    ) => ServerResponse;
  };
};

export type RouteOptions<
  Z extends jsend.Dictionary,
> = {
  schema?: ZodType<Z>;
  resolve: (
    options: ResolverOptions & { input: z.infer<ZodType<Z>> },
  ) => RouteHandlerResult;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  type?: InputType;
  rules?: RuleHandler[];
};
