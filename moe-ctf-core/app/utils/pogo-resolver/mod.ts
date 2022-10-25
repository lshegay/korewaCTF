import { parse as parseQuery } from 'queryString';
import { formDataToObject } from 'form_data_to_object';

import * as jsend from './jsend.ts';
import { RuleHandler } from './rule.ts';
import { RouteHandler, RouteOptions } from './types.ts';
import { isNil } from '../mod.ts';
export { useRule } from './rule.ts';

export enum InputType {
  JSON = 0,
  FORM_DATA = 1,
  PARAMS = 2,
}

export const defineManipulator = () => {
  const middlewares: RuleHandler[] = [];

  const useRoute = <
    Z extends jsend.Dictionary,
  >(options: RouteOptions<Z>) => {
    const { schema, resolve, type, rules, method } = {
      type: InputType.JSON,
      method: 'GET',
      ...options,
    };

    const handler: RouteHandler = async (request, h) => {
      const res = {
        success: (data?: jsend.Dictionary) => {
          request.response.body = jsend.success(data);
          return request.response;
        },
        fail: (data?: jsend.Dictionary) => {
          request.response.body = jsend.fail(data);
          return request.response;
        },
        error: (message: string, data?: jsend.Dictionary) => {
          request.response.body = jsend.error(message, data);
          return request.response;
        },
      };

      for (const rule of middlewares) {
        const result = rule({ h, req: request, res });
        
        if (!isNil(result)) return result;
      }

      if (request.method != method) {
        return res.error('Page Not Found').code(404);
      }

      if (rules) {
        for (const rule of rules) {
          const result = await rule({ h, req: request, res });
  
          if (!isNil(result)) return result;
        }
      }

      const { raw } = request;

      if (!schema) {
        return resolve({ req: request, h, res, input: {} as Z });
      }

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
      if (!result.success) {
        request.response.body = jsend.zodFail(result);
        return request.response;
      }


      return resolve({
        input: result.data,
        h,
        req: request,
        res,
      });
    };

    return handler;
  };

  return { middlewares, useRoute };
};
