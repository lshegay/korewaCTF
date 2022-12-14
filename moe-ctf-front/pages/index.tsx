import { useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Lazy from 'lazy.js';

import { fetcher } from '@setup/ky';
import Navigation from '@components/Navigation';
import Header from '@components/Header';
import { Post } from '@utils/types';
import * as jsend from '@utils/jsend';

const Page: NextPage = () => {
  const router = useRouter();
  const { data, isValidating } = useSWR<
    jsend.Response<{ posts: Post[] }, any, any>
  >('posts?limit=100', fetcher);

  const posts = useMemo(() => {
    if (
      !isValidating &&
      data?.status == 'success' &&
      data.data?.posts?.length
    ) {
      return Lazy(data.data.posts)
        .sortBy('created', true)
        .map(({ id, name, content, created }) => (
          <div
            key={id}
            className="mb-4 block rounded-lg border border-neutral-200 p-7 transition-colors"
          >
            <h5>{name}</h5>
            <p className="mb-3 text-xs">
              {new Intl.DateTimeFormat('default', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }).format(new Date(created))}
            </p>
            <p className="break-words">{content}</p>
          </div>
        ))
        .toArray();
    }
    return [];
  }, [data, isValidating]);

  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>
      <div className="flex flex-col">
        <Header />
        <div className="container mx-auto">
          <Navigation active={router.asPath} className="mb-10" />
          <div className="flex justify-between">
            <div>
              <h3>Posts</h3>
              <p className="mb-10 text-sm uppercase text-gray-500">
                List of Posts
              </p>
            </div>
          </div>
          <div className="flex flex-col">{posts}</div>
        </div>
      </div>
    </>
  );
};

export default Page;
