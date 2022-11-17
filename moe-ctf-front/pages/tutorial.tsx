import { useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Lazy from 'lazy.js';

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
            <p>{content}</p>
          </div>
        ))
        .toArray();
    }
    return [];
  }, [data, isValidating]);

  return (
    <>
      <Head>
        <title>Tutorial</title>
      </Head>
      <div className="flex flex-col">
        <Header />
        <div className="container mx-auto">
          <Navigation active={router.asPath} className="mb-10" />
          <div className="flex justify-between">
            <div>
              <h3>Tutorial</h3>
              <p className="mb-10 text-sm uppercase text-gray-500">
                Rules and Instructions
              </p>
            </div>
          </div>
          <div className="flex flex-col">
            <p>
              Capture The Flag (CTF) is a computer security compition where
              players solve puzzles (or tasks) invloving web technologies,
              computer vulnerabilities, cryptography and more. When players
              solve them they get a &quot;flag,&quot; a secret string which can
              be exchanged for points. The more points a team earns, the higher
              up it moves in rank.
            </p>
            <h5>Rules</h5>
            <p>Users are not allowed to: </p>
            <ul>
              <li>Break system and infrastructure of CTF platform</li>
              <li>
                Cheat and upload answers on the internet before comptition has
                ended
              </li>
              <li>Brute force flags.</li>
            </ul>
            <h5>Platform Units</h5>
            <h6>Posts</h6>
            <p>
              Organizators regulary upload news which can be viewed on{' '}
              <Link href="/" className="underline">
                Posts
              </Link>{' '}
              page. This allows users to see fresh announcements and other
              information about competition.
            </p>
            <h6>Tasks</h6>
            <p>
              Users can view all tasks on{' '}
              <Link href="/tasks" className="underline">
                Tasks
              </Link>{' '}
              page. Every task has its own title, description, genres and number
              of points player can get after solving it. Also some of tasks have
              attached files that should be used to solve puzzles.
            </p>
            <p>
              Users can click on any of this tasks which relocates to the Task
              page. There are task&apos;s full information, link to download
              attached file and input control where users can submit their
              flags. Also on this page players can view a record table with
              dates of solving.
            </p>
            <p>
              When user solves the puzzle they get points. Points are
              counted dynamically depending on how many users have solved the
              same tasks before or after. Basically this means that whenever
              task is easy to solve, all users get less points for it.
            </p>
            <h6>Scoreboard</h6>
            <p>
              The page{' '}
              <Link href="/scoreboard" className="underline">
                Scoreboard
              </Link>{' '}
              has a table with users and their scores.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
