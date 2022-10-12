import ServerRequest from 'https://deno.land/x/pogo@v0.6.0/lib/request.ts';
import { RouteHandlerResult } from 'https://deno.land/x/pogo@v0.6.0/lib/types.ts';
import ServerResponse from 'https://deno.land/x/pogo@v0.6.0/lib/response.ts';
import { parse as parseQuery } from 'queryString';

import { Toolkit } from 'pogo';
import { z, ZodType } from 'zod';
import { formDataToObject } from 'form_data_to_object';
import * as jsend from './jsend.ts';
import { RuleHandler } from './rule.ts';

import { User } from '../../resolvers/users/mod.ts';

export { useRule } from './rule.ts';

export type RequestDictionary = { user?: User };

export enum InputType {
  JSON = 0,
  FORM_DATA = 1,
  PARAMS = 2,
}

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
  type?: InputType;
  rules?: RuleHandler[];
}

export const useRoute = <
  Z extends jsend.Dictionary,
>(options: RouteOptions<Z>) => {
  const { schema, resolve, type, rules } = {
    type: InputType.JSON,
    ...options,
  };

  const r: RouteHandler = async (request, h) => {
    const res = {
      success: (data?: jsend.Dictionary | undefined) =>
        h.response(jsend.success(data)),
      fail: (data?: jsend.Dictionary | undefined) =>
        h.response(jsend.fail(data)),
      error: (message: string, data?: jsend.Dictionary | undefined) =>
        h.response(jsend.error(message, data)),
    };

    let req = request;
    if (rules) {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];

        const result = await rule({ h, req, res });
        if (result.req) {
          req = result.req;
        } else return result.res;
      }
    }

    const { raw } = req;

    if (!schema) return resolve({ req, h, res, input: {} as Z });

    let input: Record<string, unknown>;
    switch (type) {
      case InputType.JSON: {
        try {
          input = await raw.json();
        } catch (_) {
          return jsend.error('Input values should be JSON.');
        }
        break;
      }
      case InputType.FORM_DATA: {
        try {
          const formData = await raw.formData();
          input = formDataToObject(formData);
        } catch (_) {
          return jsend.error('Input values should be JSON.');
        }
        break;
      }
      case InputType.PARAMS: {
        try {
          input = parseQuery(request.search, {
            arrayFormat: 'bracket',
            parseBooleans: true,
            parseNumbers: true,
          });
        } catch (_) {
          return jsend.error('Input params are not valid.');
        }
        break;
      }
    }

    const result = await schema.safeParseAsync(input);
    if (!result.success) return jsend.zodFail(result);

    return resolve({ input: result.data, h, req, res });
  };

  return r;
};
