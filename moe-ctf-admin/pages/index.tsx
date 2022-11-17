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
import { Task } from '@utils/types';
import * as jsend from '@utils/jsend';

const Home: NextPage = () => {
  const router = useRouter();
  const { data, isValidating } = useSWR<
    jsend.Response<{ tasks: Task[] }, any, any>
  >('tasks', fetcher);

  const tasks = useMemo(() => {
    if (!isValidating && data?.status == 'success') {
      return data.data?.tasks?.map(({ id, name, tags, content }) => (
        <Link
          href={`/tasks/${id}`}
          key={id}
          className="block rounded-lg border border-neutral-200 p-7 transition-colors hover:border-neutral-400"
        >
          <h5>{name}</h5>
          <div className="mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="mr-1 rounded-full border-2 border-black py-0.5 px-2 text-sm font-bold text-black"
              >
                {tag}
              </span>
            ))}
          </div>
          <p>{truncate(content, { length: 100 })}</p>
        </Link>
      ));
    }
    return [];
  }, [data, isValidating]);

  return (
    <>
      <Head>
        <title>Tasks</title>
      </Head>
      <div className="flex flex-col">
        <Header />
        <div className="container mx-auto">
          <Navigation active={router.asPath} className="mb-10" />
          <div className="flex justify-between">
            <div>
              <h3>Tasks</h3>
              <p className="mb-10 text-sm uppercase text-gray-500">
                List of Tasks
              </p>
            </div>
            <div>
              <Link
                href="/tasks/new"
                className="mr-2 block rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-sm text-gray-900 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 active:bg-neutral-200"
              >
                Create New +
              </Link>
            </div>
          </div>
          <div className="mx-4 grid gap-4 md:m-0 md:grid-cols-3 ">{tasks}</div>
        </div>
      </div>
    </>
  );
};

export default Home;
