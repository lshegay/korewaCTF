import { RouteHandlerResult } from 'https://deno.land/x/pogo@v0.6.0/lib/types.ts';
import { Maybe } from '../mod.ts';

import { Dictionary } from './jsend.ts';
import { ResolverOptions } from './types.ts';

export type RuleHandler = (
  options: ResolverOptions,
) => Maybe<RouteHandlerResult> | Promise<Maybe<RouteHandlerResult>>;

export type RuleResolveOptions<O> = ResolverOptions & { options?: O };

export type RuleOptions<O extends Dictionary> = {
  options?: O;
  resolve: (
    options: RuleResolveOptions<O>,
  ) => Maybe<RouteHandlerResult> | Promise<Maybe<RouteHandlerResult>>;
};

export const useRule = <O extends Dictionary>({ resolve }: RuleOptions<O>) => {
  return (options?: O) => {
    const rule: RuleHandler = ({ h, req, res }) =>
      resolve({ h, req, res, options });

    return rule;
  };
};
