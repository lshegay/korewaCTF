export type Maybe<T> = undefined | null | T;

export function isNil<T>(v: Maybe<T>): v is undefined | null {
  return v === null || v === undefined;
}

export * as jwt from './jwt/mod.ts';
export * as pogoResolver from './pogo-resolver/mod.ts';