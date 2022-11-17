import Link from 'next/link';
import classNames from 'classnames';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

const links = [
  {
    href: '/',
    label: 'Tasks',
  },
  {
    href: '/posts',
    label: 'Posts',
  },
  {
    href: '/users',
    label: 'Users',
  },
];

export type Props = {
  active: string;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const Navigation = ({ active, className, ...attr }: Props) => {
  return (
    <div
      {...attr}
      className={classNames(
        'xt-links-default -ml-3 rounded-full bg-white bg-opacity-80 p-1.5 text-gray-900 backdrop-blur-sm backdrop-saturate-50 backdrop-filter',
        className,
      )}
    >
      <nav
        aria-label="Navigation"
        className="xt-list xt-list-1 flex-col text-center md:flex-row md:flex-nowrap md:text-left"
      >
        {links.map(({ href, label }) => (
          <Link
            key={href}
            role="button"
            className={classNames(
              'rounded-md py-1 px-2 decoration-2 underline-offset-8 transition-colors duration-150 hover:bg-neutral-100 active:bg-neutral-200',
              { 'font-bold text-black underline': active == href },
            )}
            href={href}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Navigation;
