import { useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Lazy from 'lazy.js';

import { fetcher } from '@setup/ky';
import Navigation from '@components/Navigation';
import TaskForm from '@components/tasks/Form';
import Header from '@components/Header';
import { Task } from '@utils/types';
import * as jsend from '@utils/jsend';
import Sidebar from '@components/Sidebar';

const Home: NextPage = () => {
  const router = useRouter();
  const { tid } = router.query;

  const { data, isValidating, mutate } = useSWR<jsend.Response<Task, any, any>>(
    `task?id=${tid}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const tableRows = useMemo(() => {
    if (
      isValidating ||
      data?.status != jsend.Status.SUCCESS ||
      !data.data?.solved
    )
      return null;
    const { solved } = data.data;

    const rows = Lazy<{
      date: number;
      nickname: string;
    }>(solved)
      .values()
      .map((value) => ({ ...value }))
      .sortBy('date')
      .toArray();

    return rows.map(({ date, nickname }, index) => (
      <tr key={nickname}>
        <th className="border border-gray-200 py-2 px-4 text-left align-top text-xs font-medium uppercase leading-snug tracking-wider">
          {index + 1}
        </th>
        <td className="border border-gray-200 py-2 px-4 align-top text-sm leading-snug">
          {nickname}
        </td>
        <td className="border border-gray-200 py-2 px-4 align-top text-sm leading-snug">
          {new Intl.DateTimeFormat('default', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          }).format(new Date(date))}
        </td>
      </tr>
    ));
  }, [isValidating, data]);

  return (
    <>
      <Head>
        <title>Task</title>
      </Head>
      <div className="flex flex-col">
        <Header />
        <div className="container mx-auto">
          <Navigation active={router.asPath} className="mb-10" />
          <div>
            <h3>{data?.data?.name}</h3>
            <p className="mb-10 text-sm uppercase text-gray-500">Task</p>
            <div className="xt-row xt-row-6">
              <div className="w-full md:w-8/12 ">
                {!isValidating && data?.status == jsend.Status.SUCCESS && (
                  <>
                    <div
                      id="score"
                      className="t-links-default xt-card mb-10 rounded-2xl bg-gray-100 p-7 text-base text-gray-900 sm:p-9"
                    >
                      <h5>Score</h5>
                      <table className="xt-my-auto my-4 w-full">
                        <thead>
                          <tr>
                            <th className="border border-gray-200 py-2 px-4 text-left align-top text-xs font-medium uppercase leading-snug tracking-wider">
                              #
                            </th>
                            <th className="border border-gray-200 py-2 px-4 text-left align-top text-xs font-medium uppercase leading-snug tracking-wider">
                              User
                            </th>
                            <th className="border border-gray-200 py-2 px-4 text-left align-top text-xs font-medium uppercase leading-snug tracking-wider">
                              Solved Time
                            </th>
                          </tr>
                        </thead>
                        <tbody>{tableRows}</tbody>
                      </table>
                    </div>
                    <TaskForm
                      id="information"
                      task={data.data}
                      className="mb-10"
                      onSuccess={(t) => {
                        mutate({ ...data, data: t });
                      }}
                    />
                  </>
                )}
              </div>
              <div className="w-full md:w-4/12">
                <Sidebar
                  links={[
                    { id: 'score', label: 'Score' },
                    { id: 'information', label: 'Information' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
