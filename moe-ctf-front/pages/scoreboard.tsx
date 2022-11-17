import { useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Lazy from 'lazy.js';

import { fetcher } from '@setup/ky';
import Navigation from '@components/Navigation';
import Header from '@components/Header';
import { Scoreboard, ScoreboardUser, UserRole } from '@utils/types';
import * as jsend from '@utils/jsend';

const Page: NextPage = () => {
  const router = useRouter();

  const { data, isValidating, mutate } = useSWR<
    jsend.Response<{ scoreboard: Scoreboard }, any, any>
  >(`scoreboard`, fetcher);

  const tableRows = useMemo(() => {
    if (
      isValidating ||
      data?.status != jsend.Status.SUCCESS ||
      !data.data?.scoreboard
    )
      return null;

    let place = 1;

    return Lazy(data.data.scoreboard)
      .map(([_, { id, nickname, taskCount, score }]) => (
        <tr key={id}>
          <th className="border border-gray-200 py-2 px-4 text-left align-top text-sm font-medium leading-snug">
            {place++}
          </th>
          <th className="border border-gray-200 py-2 px-4 text-left align-top text-sm font-medium leading-snug">
            {nickname}
          </th>
          <td className="border border-gray-200 py-2 px-4 align-top text-sm leading-snug">
            {taskCount}
          </td>
          <td className="border border-gray-200 py-2 px-4 align-top text-sm leading-snug">
            {score}
          </td>
        </tr>
      ))
      .toArray();
  }, [isValidating, data]);

  return (
    <>
      <Head>
        <title>Scoreboard</title>
      </Head>
      <div className="flex flex-col">
        <Header />
        <div className="container mx-auto">
          <Navigation active={router.asPath} className="mb-10" />
          <div>
            <h3>Scoreboard</h3>
            <p className="mb-10 text-sm uppercase text-gray-500">
              List of Users
            </p>
            <div className="w-full">
              {!isValidating && data?.status == jsend.Status.SUCCESS && (
                <>
                  <div className="t-links-default xt-card mb-10 rounded-2xl bg-gray-100 p-7 text-base text-gray-900 sm:p-9">
                    <table className="xt-my-auto my-4 w-full">
                      <thead>
                        <tr>
                          <th className="border border-gray-200 py-2 px-4 text-left align-top text-xs font-medium uppercase leading-snug tracking-wider">
                            Place
                          </th>
                          <th className="border border-gray-200 py-2 px-4 text-left align-top text-xs font-medium uppercase leading-snug tracking-wider">
                            Username
                          </th>
                          <th className="border border-gray-200 py-2 px-4 text-left align-top text-xs font-medium uppercase leading-snug tracking-wider">
                            Resolved Tasks
                          </th>
                          <th className="border border-gray-200 py-2 px-4 text-left align-top text-xs font-medium uppercase leading-snug tracking-wider">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>{tableRows}</tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
