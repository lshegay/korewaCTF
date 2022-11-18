import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Navigation from '@components/Navigation';
import TaskForm from '@components/tasks/Form';
import Header from '@components/Header';
import Sidebar from '@components/Sidebar';

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Create Task</title>
      </Head>
      <div className="flex flex-col">
        <Header />
        <div className="container mx-auto">
          <Navigation active={router.asPath} className="mb-10" />
          <div>
            <h3>Create Task</h3>
            <p className="mb-10 text-sm uppercase text-gray-500">Task</p>
            <div className="xt-row xt-row-6">
              <div className="w-full md:w-8/12 ">
                <TaskForm
                  id="information"
                  className="mb-10"
                  onSuccess={(t) => {
                    router.push(`/tasks/${t.id}`);
                  }}
                />
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
