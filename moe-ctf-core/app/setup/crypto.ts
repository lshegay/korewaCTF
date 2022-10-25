import { crypto } from 'https://deno.land/std@0.159.0/crypto/mod.ts';
import { cryptoRandomString } from 'https://deno.land/x/crypto_random_string@1.1.0/mod.ts';
import { bufferToHex } from 'hextools';
import { resolve } from 'path';

export let salt!: string;

/**
 * If salt.txt exists, sets global secret variable with value from the file,
 * else creates a new salt and saves it into salt.txt
 *
 * Loads global salt variable with value.
 * @param dir Directory where to save secret salt data.
 * @returns salt
 */
export const defineSalt = async (dir: string) => {
  const filename = 'salt.txt';

  try {
    await Deno.stat(dir);
  } catch (_) {
    // dir folder is not exist
    Deno.mkdir(resolve(dir));
  }

  try {
    salt = await Deno.readTextFile(resolve(dir, filename));
    return salt;
  } catch (_) {
    // nothing happens here
  }

  try {
    salt = cryptoRandomString({ length: 20, type: 'base64' });

    Deno.writeTextFile(resolve(dir, filename), salt);
    return salt;
  } catch (_) {
    // nothing happens here
  }
};

export const createPbkdf2Hash = async (
  text: string,
  options: Partial<Pbkdf2Params> = {},
) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(text),
    { name: 'PBKDF2' },
    false,
    [
      'deriveBits',
    ],
  );

  const hash = await crypto.subtle.deriveBits(
    {
      iterations: 30,
      hash: 'SHA-512',
      name: 'PBKDF2',
      ...options,
      salt: new TextEncoder().encode(salt),
    },
    key,
    128,
  );

  return bufferToHex(hash);
};
