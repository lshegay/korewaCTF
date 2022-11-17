/** JSend specification wrapper functions */

export type Maybe<T> = undefined | null | T;

export function isNil<T>(v: Maybe<T>): v is undefined | null {
  return v === null || v === undefined;
}

export enum Status {
  SUCCESS = 'success',
  FAIL = 'fail',
  ERROR = 'error',
}

export type Dictionary = Record<string, unknown>;
export type DocumentArray = unknown[];

export type ResponseSuccess<T extends Dictionary> = {
  status: Status.SUCCESS;
  data: Partial<T> | null; // TODO: make it T | undefined
};

export type ResponseFail<T extends Dictionary> = {
  status: Status.FAIL;
  data: Partial<T> | null; // TODO: make it T | undefined
};

export type ResponseError<T extends Dictionary> = {
  status: Status.ERROR;
  message: string;
  data?: Partial<T>;
  code?: number;
};

export type Response<
  TSuccess extends Dictionary = Dictionary,
  TFail extends Dictionary = Dictionary,
  TError extends Dictionary = Dictionary,
> =
  | ResponseSuccess<TSuccess>
  | ResponseFail<TFail>
  | ResponseError<TError>;

const filterUndefines = <T extends Dictionary, K extends keyof T>(data: T) => {
  const ret: Partial<T> = {};
  const entries = Object.entries(data) as [K, T[K]][];

  for (const [key, value] of entries) {
    if (typeof value != 'undefined') {
      ret[key] = value;
    }
  }

  return ret;
}

export const success = <T extends Dictionary>(
  data?: Maybe<T>,
): ResponseSuccess<T> => ({
  status: Status.SUCCESS,
  data: isNil(data) ? null : filterUndefines(data),
});

export const fail = <T extends Dictionary>(
  data?: Maybe<Partial<T>>,
): ResponseFail<T> => ({
  status: Status.FAIL,
  data: isNil(data) ? null : filterUndefines(data),
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
