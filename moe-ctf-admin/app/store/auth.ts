import { createEvent, createStore } from 'effector';
import { persist } from 'effector-storage/local';
import { ky } from '@setup/ky';

export type StoreProps = {
  token: string | null;
};

export const setToken = createEvent<string | null>();

setToken.watch((token) => {
  ky.extend({
    headers: {
      Authorization: `bearer ${token}`,
    },
  });
});

export const $auth = createStore<StoreProps>(
  { token: null },
  { name: 'authorization' },
).on(setToken, (state, token) => ({ ...state, token }));
persist({ store: $auth });
