import { useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { truncate } from 'lodash';

import { fetcher } from '@setup/ky';
import Navigation from '@components/Navigation';
import Header from '@components/Header';
import { Post } from '@utils/types';
import * as jsend from '@utils/jsend';

const Home: NextPage = () => {
  const router = useRouter();
  const { data, isValidating } = useSWR<
    jsend.Response<{ posts: Post[] }, any, any>
  >('posts', fetcher);

  const posts = useMemo(() => {
    if (!isValidating && data?.status == 'success') {
      return data.data?.posts?.map(({ id, name, content, created }) => (
        <Link
          href={`/posts/${id}`}
          key={id}
          className="block rounded-lg border border-neutral-200 p-7 transition-colors hover:border-neutral-400"
        >
          <h5>{name}</h5>
          <p className="mb-3 text-xs">
            {new Intl.DateTimeFormat('default', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(new Date(created))}
          </p>
          <p>{truncate(content, { length: 100 })}</p>
        </Link>
      ));
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
            <div>
              <Link
                href="/posts/new"
                className="mr-2 block rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-sm text-gray-900 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 active:bg-neutral-200"
              >
                Create New +
              </Link>
            </div>
          </div>
          <div className="mx-4 grid gap-4 md:m-0 md:grid-cols-3 ">{posts}</div>
        </div>
      </div>
    </>
  );
};

export default Home;
