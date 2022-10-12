import { RouteHandlerResult } from 'https://deno.land/x/pogo@v0.6.0/lib/types.ts';

import { Dictionary } from './jsend.ts';
import { ResolverOptions, ResolverRequest } from './mod.ts';

export type RuleHandlerReturn = { req?: never; res: RouteHandlerResult } | {
  req: ResolverRequest;
  res?: never;
};

export type RuleHandler = (
  options: ResolverOptions,
) => RuleHandlerReturn | Promise<RuleHandlerReturn>;

export type RuleResolveOptions<O> = ResolverOptions & { options?: O };

export type RuleOptions<O extends Dictionary> = {
  options?: O;
  resolve: (
    options: RuleResolveOptions<O>,
  ) => RuleHandlerReturn | Promise<RuleHandlerReturn>;
};

export const useRule = <O extends Dictionary>({ resolve }: RuleOptions<O>) => {
  return (options?: O) => {
    const rule: RuleHandler = ({ h, req, res }) =>
      resolve({ h, req, res, options });

    return rule;
  };
};
