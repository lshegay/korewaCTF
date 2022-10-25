/** JSend specification wrapper functions */

import { SafeParseError } from 'https://deno.land/x/zod@v3.19.1/types.ts';
import { mapValues } from 'https://deno.land/std@0.159.0/collections/map_values.ts';
import { filterValues } from 'https://deno.land/std@0.159.0/collections/filter_values.ts';
import { isNil, Maybe } from "../mod.ts";

export enum Status {
  SUCCESS = 'success',
  FAIL = 'fail',
  ERROR = 'error',
}

export type Dictionary = Record<string, unknown>;
export type DocumentArray = unknown[];

export type ResponseSuccess<T extends Dictionary> = {
  status: Status.SUCCESS;
  data: Partial<T> | null;
};

export type ResponseFail<T extends Dictionary> = {
  status: Status.FAIL;
  data: Partial<T> | null;
};

export type ResponseError<T extends Dictionary> = {
  status: Status.ERROR;
  message: string;
  data?: Partial<T>;
  code?: number;
};

export type Response<
  TSuccess extends Dictionary,
  TFail extends Dictionary,
  TError extends Dictionary,
> =
  | ResponseSuccess<TSuccess>
  | ResponseFail<TFail>
  | ResponseError<TError>;

const filterUndefines = <T extends Dictionary>(data: T) =>
  filterValues(data, (v) => typeof v != 'undefined') as Partial<T>;

export const success = <T extends Dictionary>(
  data?: Maybe<T>,
): ResponseSuccess<T> => ({
  status: Status.SUCCESS,
  data: isNil(data)
    ? null
    : filterUndefines(data),
});

export const fail = <T extends Dictionary>(
  data?: Maybe<Partial<T>>,
): ResponseFail<T> => ({
  status: Status.FAIL,
  data: isNil(data)
    ? null
    : filterUndefines(data),
});

export const error = <T extends Dictionary>(
  message: string,
  data?: T,
  code?: number,
) => {
  const response: ResponseError<T> = {
    status: Status.ERROR,
    message,
  };
  if (typeof code != 'undefined') response.code = code;
  if (typeof data != 'undefined') response.data = filterUndefines(data);

  return response;
};

export const zodFail = <T extends Dictionary>(
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
export const isValid = (obj?: Dictionary): boolean => {
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
