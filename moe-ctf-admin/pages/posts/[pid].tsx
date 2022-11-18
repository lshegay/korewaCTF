import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { fetcher } from '@setup/ky';
import Navigation from '@components/Navigation';
import PostForm from '@components/posts/Form';
import Header from '@components/Header';
import Sidebar from '@components/Sidebar';
import { Post } from '@utils/types';
import * as jsend from '@utils/jsend';

const Home: NextPage = () => {
  const router = useRouter();
  const { pid } = router.query;

  const { data, isValidating, mutate } = useSWR<jsend.Response<Post, any, any>>(
    `post?id=${pid}`,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  return (
    <>
      <Head>
        <title>Post</title>
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
                    <PostForm
                      id="information"
                      post={data.data}
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
                  links={[{ id: 'information', label: 'Information' }]}
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
