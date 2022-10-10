/** JSend specification wrapper functions */

import { SafeParseError } from 'https://deno.land/x/zod@v3.19.1/types.ts';
import { mapValues } from 'https://deno.land/std@0.159.0/collections/map_values.ts';
import { filterValues } from 'https://deno.land/std@0.159.0/collections/filter_values.ts';

export enum Status {
  SUCCESS = 'success',
  FAIL = 'fail',
  ERROR = 'error',
}

export type ResponseSuccess<T extends Record<string, unknown>> = {
  status: Status.SUCCESS;
  data: Partial<T> | null;
};

export type ResponseFail<T extends Record<string, unknown>> = {
  status: Status.FAIL;
  data: Partial<T> | null;
};

export type ResponseError<T extends Record<string, unknown>> = {
  status: Status.ERROR;
  message: string;
  data?: Partial<T>;
  code?: number;
};

export type Response<
  TSuccess extends Record<string, unknown>,
  TFail extends TSuccess,
  TError extends Record<string, unknown>,
> =
  | ResponseSuccess<TSuccess>
  | ResponseFail<TFail>
  | ResponseError<TError>;

const filterUndefines = <T extends Record<string, unknown>>(data: T): Partial<T> =>
  filterValues(data, (v) => typeof v != 'undefined') as Partial<T>;

export const success = <T extends Record<string, unknown>>(
  data?: T,
): ResponseSuccess<T> => ({
  status: Status.SUCCESS,
  data: typeof data == 'undefined' ? null : filterUndefines<T>(data),
});

export const fail = <T extends Record<string, unknown>>(
  data?: Partial<T>,
): ResponseFail<T> => ({
  status: Status.FAIL,
  data: typeof data == 'undefined' ? null : filterUndefines(data),
});

export const error = <T extends Record<string, unknown>>(
  message: string,
  data?: T,
  code?: number,
) => {
  const response: ResponseError<T> = {
    status: Status.ERROR,
    message,
  };
  if (code) response.code = code;
  if (data) response.data = filterUndefines(data);

  return response;
};

export const zodFail = <T extends Record<string, unknown>>(
  safeParse: SafeParseError<T>,
) => {
  return fail(
    mapValues(
      safeParse.error.flatten().fieldErrors,
      (v: unknown) => Array.isArray(v) ? v.join(', ') : v,
    ),
  );
};

/**
 * IsValid returns true if obj is valid for JSend API or not
 * @param obj - the JSend response
 */
export const isValid = (obj?: Record<string, unknown>): boolean => {
  if (!obj) return false;
  if (!obj.status) return false;

  if ((obj.status == 'success' || obj.status == 'fail')) {
    return typeof obj.data != 'undefined';
  }

  if (obj.status == 'error') {
    return typeof obj.message != 'undefined';
  }

  return false;
};
