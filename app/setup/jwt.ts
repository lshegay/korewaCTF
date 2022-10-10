import { crypto } from 'https://deno.land/std@0.159.0/crypto/mod.ts';
import { DocumentValue } from 'https://deno.land/x/aloedb@0.9.0/mod.ts';
import { create, verify } from 'https://deno.land/x/djwt@v2.7/mod.ts';

import { resolve } from 'path';

export let secret!: CryptoKey;

/**
 * Creates JWT data which can be used for user authorization and validation.
 * @param payload any data as object
 * @param exp expiration time in seconds
 * @returns {string} JWT string
 */
export const createToken = async (
  payload: Record<string, DocumentValue>,
  sessionAge: number,
) => {
  const iat = new Date().valueOf();
  return await create(
    { alg: 'HS512', typ: 'JWT' },
    { ...payload, exp: iat + sessionAge, iat },
    secret,
  );
};

/**
 * Verifies if user and their JWT are valid.
 * @param jwt JWT string
 * @returns {Promise<Payload | null>}
 */
export const verifyToken = async (jwt: string) => {
  try {
    return await verify(jwt, secret);
  } catch (e) {
    console.log(e);
    return null;
  }
};

/**
 * If secret.json exists, sets global secret variable with value from the file,
 * else creates a new CryptoKey and exports JsonWebKey into secret.json.
 *
 * Loads global secret variable with value.
 * @param dir Directory where to save secret JsonWebKey data
 * @returns {Promise<CryptoKey>} secret CryptoKey
 */
export const defineSecret = async (dir: string) => {
  const filename = 'secret.json';

  try {
    await Deno.stat(dir);
  } catch (_) {
    // dir folder is not exist
    Deno.mkdir(resolve(dir));
  }

  try {
    const file = await Deno.readTextFile(resolve(dir, filename));
    const key: JsonWebKey = JSON.parse(file);
    secret = await crypto.subtle.importKey(
      'jwk',
      key,
      { name: 'HMAC', hash: 'SHA-512' },
      true,
      ['sign', 'verify'],
    );
    return secret;
  } catch (_) {
    // nothing happens here
  }

  try {
    secret = await crypto.subtle.generateKey(
      { name: 'HMAC', hash: 'SHA-512' },
      true,
      ['sign', 'verify'],
    );
    const key = await crypto.subtle.exportKey('jwk', secret);

    Deno.writeTextFile(resolve(dir, filename), JSON.stringify(key));
    return secret;
  } catch (_) {
    // nothing happens here
  }
};
