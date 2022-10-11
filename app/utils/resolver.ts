import ServerRequest from 'https://deno.land/x/pogo@v0.6.0/lib/request.ts';
import { RouteHandlerResult } from 'https://deno.land/x/pogo@v0.6.0/lib/types.ts';
import ServerResponse from 'https://deno.land/x/pogo@v0.6.0/lib/response.ts';
import { Toolkit } from 'pogo';
import { z, ZodType } from 'zod';
import { formDataToObject } from 'form_data_to_object';
import * as jsend from './jsend.ts';
import { User } from '../resolvers/users/mod.ts';

export type ResolverRequest = ServerRequest & { user?: User };
export type RouteHandler = (
  request: ResolverRequest,
  h: Toolkit,
) => RouteHandlerResult;

export enum InputType {
  JSON = 0,
  FORM_DATA = 1,
}

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
  schema: ZodType<Z>;
  query?: never;
  mutation: (
    options: ResolverOptions & { input: z.infer<ZodType<Z>> },
  ) => RouteHandlerResult;
  type?: InputType;
} | {
  schema?: never;
  query: (options: ResolverOptions) => RouteHandlerResult;
  mutation?: never;
  type?: InputType;
};

export const useRoute = <
  Z extends jsend.Dictionary,
>(options: RouteOptions<Z>) => {
  const { schema, mutation, query, type } = {
    type: InputType.JSON,
    ...options,
  };

  const r: RouteHandler = async (req, h) => {
    const { raw } = req;

    const res = {
      success: (data?: jsend.Dictionary | undefined) =>
        h.response(jsend.success(data)),
      fail: (data?: jsend.Dictionary | undefined) =>
        h.response(jsend.fail(data)),
      error: (message: string, data?: jsend.Dictionary | undefined) =>
        h.response(jsend.error(message, data)),
    };

    if (!schema) return query({ req, h, res });

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
    }

    const result = await schema.safeParseAsync(input);
    if (!result.success) return jsend.zodFail(result);

    return mutation({ input: result.data, h, req, res });
  };

  return r;
};
