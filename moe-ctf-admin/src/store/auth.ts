import { createEvent, createStore } from 'effector';
import { persist } from 'effector-storage/local';
import { ky, setKy } from '@setup/ky';

export type StoreProps = {
  token: string | null;
};

export const setToken = createEvent<string | null>();

export const $auth = createStore<StoreProps>(
  { token: null },
  { name: 'authorization' },
).on(setToken, (state, token) => ({ ...state, token }));

$auth.watch(({ token }) => {
  if (token) {
    setKy(
      ky.extend({
        headers: {
          Authorization: `bearer ${token}`,
        },
      }),
    );
  } else {
    setKy(
      ky.extend({
        headers: {
          Authorization: undefined,
        },
      }),
    );
  }
});

persist({
  store: $auth,
  serialize: (v) => {
    return JSON.stringify(v);
  },
  deserialize: (v) => {
    if (!v) return;

    try {
      return JSON.parse(v);
    } catch (error) {
      localStorage.removeItem($auth.shortName);
    }
  },
});
