import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import classNames from 'classnames';

type Props = {
  children: JSX.Element;
  content?: JSX.Element;
  links: {
    href: string;
    label: string;
    onClick?: () => Promise<void> | void;
  }[];
};

const Dropdown = ({ children, content, links }: Props) => {
  return (
    <div className="w-56 text-right">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button>{children}</Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              {content && <div>{content}</div>}
              {links.map(({ href, label, onClick }) => (
                <Menu.Item key={href}>
                  {({ active }) => (
                    <Link
                      onClick={onClick}
                      href={href}
                      className={classNames(
                        'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900',
                        {
                          'bg-neutral-200': active,
                        },
                      )}
                    >
                      {label}
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default Dropdown;
