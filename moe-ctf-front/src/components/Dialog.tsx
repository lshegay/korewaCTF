import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export type Props = {
  title: string;
  content: string;
  controls: JSX.Element;
  isOpen: boolean;
  setIsOpen: (_: boolean) => void;
};

const DefaultDialog = ({
  title,
  content,
  controls,
  isOpen,
  setIsOpen,
}: Props) => {
  const cancelButtonRef = useRef(null);

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
          initialFocus={cancelButtonRef}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{content}</p>
                  </div>

                  <div className="mt-4">
                    <button
                      ref={cancelButtonRef}
                      type="button"
                      className="mr-2 inline-flex justify-center rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium placeholder-opacity-75  transition hover:bg-neutral-100 focus:border-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 active:bg-neutral-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    {controls}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Dialog>
  );
};

export default DefaultDialog;
