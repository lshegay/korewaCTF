import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { fetcher, ky } from '@setup/ky';
import { auth } from '@store';
import { User, UserRole } from '@utils/types';
import * as jsend from '@utils/jsend';
import Dropdown from './Dropdown';

export type Props = {};

const links = [
  {
    href: '/login',
    label: 'Logout',
    onClick: () => {
      auth.setToken(null);
    },
  },
];

const Header = ({}: Props) => {
  const router = useRouter();

  const { data, isValidating } = useSWR<jsend.Response<User, any, any>>(
    'profile',
    fetcher,
  );

  useEffect(() => {
    if (isValidating) return;

    if (!data?.data || data.status != jsend.Status.SUCCESS) {
      router.push('/login');
      auth.setToken(null);
    }
  }, [router, data, isValidating]);

  return (
    <div className="flex justify-between px-10 py-5">
      <div className="flex">
        <h5>
          Capture the <span className="bg-primary-600">Moe</span>
        </h5>
      </div>

      <div className="flex">
        <Dropdown
          links={links}
          content={
            <div className="flex w-full items-center rounded-md px-2 py-2 text-sm font-bold text-gray-900">
              {data?.data?.nickname}
            </div>
          }
        >
          <div className="h-8 w-8 rounded-full bg-primary-100" />
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
