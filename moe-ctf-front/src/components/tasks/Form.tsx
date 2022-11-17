import { DetailedHTMLProps, HTMLAttributes, useState } from 'react';
import { useRouter } from 'next/router';
import { Field, Form, Formik } from 'formik';
import classNames from 'classnames';

import { ky } from '@setup/ky';
import Dialog from '@components/Dialog';
import { Task } from '@utils/types';
import * as jsend from '@utils/jsend';

export type Props = {
  task: Partial<Task> | null;
  onSuccess: () => void | Promise<void>;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const TaskForm = ({ task, onSuccess, className, ...attrs }: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {task && (
        <Dialog
          title="Are you sure?"
          content="This will permanently delete your task."
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          controls={
            <>
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white placeholder-opacity-75 transition  hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:bg-red-700"
                onClick={async () => {
                  const response = await ky
                    .post('admin/deleteTask', {
                      body: JSON.stringify({ id: task?.id }),
                    })
                    .json<jsend.Response<{ id: string }>>();

                  if (response.status == jsend.Status.SUCCESS) {
                    await router.push('/');
                  }
                }}
              >
                Delete
              </button>
            </>
          }
        />
      )}

      <div
        {...attrs}
        className={classNames(
          'xt-card xt-links-default rounded-2xl bg-gray-100 p-7 text-base text-gray-900 sm:p-9',
          className,
        )}
      >
        <h5>Information</h5>
        <Formik
          initialValues={{
            id: task?.id,
            flag: '',
          }}
          onSubmit={async (values, { setErrors, setSubmitting }) => {
            const response = await ky
              .post('submit', {
                body: JSON.stringify(values),
              })
              .json<jsend.Response<Task, Record<keyof Task, string>>>();

            switch (response.status) {
              case jsend.Status.SUCCESS: {
                onSuccess();
                break;
              }
              case jsend.Status.FAIL: {
                setErrors({ flag: response.data?.flag });
                break;
              }
              default:
                break;
            }

            setSubmitting(false);
          }}
        >
          {({ errors, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="text-xs">{task?.score} points</div>
              </div>
              <div className="mb-4">
                <label className="mb-2 inline-block">Description</label>
                <div className="text-sm whitespace-pre-wrap">{task?.content}</div>
              </div>
              {task?.filePath && (
                <div className="mb-4 text-sm">
                  <label className="inline">Attached File: </label>
                  <span
                    className="cursor-pointer text-neutral-600 underline"
                    tabIndex={0}
                    onClick={async () => {
                      if (!task?.filePath) return;
                      const filePath =
                        task.filePath[0] == '/'
                          ? task.filePath.substring(1)
                          : task.filePath;

                      const blob = await ky.get(filePath).blob();

                      const file = window.URL.createObjectURL(blob);
                      window.open(file, '_blank');
                    }}
                  >
                    {task.filePath}
                  </span>
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="flag" className="mb-2 inline-block text-sm">
                  Flag
                </label>
                <Field
                  type="text"
                  name="flag"
                  id="flag"
                  className="mb-1 block w-full rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-gray-900 placeholder-black placeholder-opacity-40 transition focus:border-neutral-400 focus:outline-none"
                  {...{
                    disabled: task?.isSolved,
                  }}
                />
                <p className="text-sm text-critical-500">{errors.flag}</p>
              </div>
              <div className="mb-2 flex">
                <button
                  className="mr-2 block rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-sm text-gray-900 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 active:bg-neutral-200"
                  type="submit"
                  {...{ disabled: task?.isSolved }}
                >
                  {task?.isSolved ? 'Solved' : 'Submit Flag'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default TaskForm;
