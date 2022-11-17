import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

export type Props = {
  links: { id: string; label: string }[];
} & DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

const Sidebar = ({ links, ...attr }: Props) => {
  const router = useRouter();
  const url = router.asPath.split('#');

  return (
    <nav {...attr} aria-label="Navigation" className="xt-list flex-col">
      {links.map(({ id, label }, index) => (
        <Link
          href={`${url[0]}#${id}`}
          key={id}
          type="button"
          className={classNames(
            'mb-2 block rounded-md bg-white py-1 px-3.5 text-right text-sm text-gray-900 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 active:bg-neutral-200',
            { 'border border-neutral-200': url[1] ? id == url[1] : index == 0 },
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default Sidebar;
