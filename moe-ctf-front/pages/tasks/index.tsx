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
import classNames from 'classnames';

const Page: NextPage = () => {
  const router = useRouter();
  const { data, isValidating } = useSWR<
    jsend.Response<{ tasks: Task[] }, any, any>
  >('tasks?limit=100', fetcher);

  const tasks = useMemo(() => {
    if (!isValidating && data?.status == 'success') {
      return data.data?.tasks?.map(
        ({ id, name, tags, content, score, isSolved }) => (
          <Link
            href={`/tasks/${id}`}
            key={id}
            className={classNames(
              'block rounded-lg border border-neutral-200 p-7 transition hover:border-neutral-400 hover:opacity-100',
              {
                'opacity-25': isSolved,
              },
            )}
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
            <p className="mb-2 text-xs">{score} points</p>
            <p>{truncate(content, { length: 100 })}</p>
          </Link>
        ),
      );
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
          </div>
          <div className="mx-4 grid gap-4 md:m-0 md:grid-cols-3 ">{tasks}</div>
        </div>
      </div>
    </>
  );
};

export default Page;
