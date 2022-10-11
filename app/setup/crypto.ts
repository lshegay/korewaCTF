import { crypto } from 'https://deno.land/std@0.159.0/crypto/mod.ts';
import { bufferToHex } from 'hextools';

export const createPbkdf2Hash = async (
  text: string,
  salt: string,
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
