import f from 'ky';
import { Fetcher } from 'swr';
import Router from 'next/router';

import { config } from './config';
import * as jsend from '@utils/jsend';

export let ky = f.create({
  prefixUrl: config.host,
});

export const setKy = (_ky: typeof f) => (ky = _ky);

export const fetcher: Fetcher<jsend.Response> = async (url: string) => {
  const response = await ky.get(url).json<jsend.Response>();

  if (!jsend.isValid(response)) {
    throw new Error('Response is not in JSend specification.');
  }

  if (
    response.status == jsend.Status.FAIL &&
    (response.data?.user as string) in
      [
        'User should be authorized.',
        'No authorization token.',
        'User has not privileges to do that.',
      ]
  ) {
    Router.push('/login');
  }

  if (response.status == jsend.Status.ERROR) {
    throw new Error(response.message);
  }

  return response;
};
