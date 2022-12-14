import { DetailedHTMLProps, HTMLAttributes, useState } from 'react';
import { useRouter } from 'next/router';
import { Field, Form, Formik } from 'formik';
import { TagsInput } from 'react-tag-input-component';
import { serialize } from 'object-to-formdata';

import { ky } from '@setup/ky';
import Dialog from '@components/Dialog';
import { Task } from '@utils/types';
import * as jsend from '@utils/jsend';
import classNames from 'classnames';

export type Props = {
  task?: Partial<Task> | null;
  onSuccess: (v: Task) => void | Promise<void>;
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
            name: task?.name ?? '',
            content: task?.content ?? '',
            flag: '',
            tags: task?.tags ?? [],
            file: null as Blob | null,
          }}
          onSubmit={async (values, { setErrors, setSubmitting }) => {
            const formData = serialize(
              {
                ...values,
                flag: values.flag.length > 0 ? values.flag : undefined,
              },
              {
                nullsAsUndefineds: true,
              },
            );

            const response = await ky
              .post(task ? 'admin/updateTask' : 'admin/task', {
                body: formData,
              })
              .json<jsend.Response<Task, Record<keyof Task, string>>>();

            switch (response.status) {
              case jsend.Status.SUCCESS: {
                onSuccess(response.data as Task);
                break;
              }
              case jsend.Status.FAIL: {
                setErrors({
                  ...(response.data as Record<keyof Task, string>),
                  file: response.data?.filePath,
                });
                break;
              }
              default:
                break;
            }

            setSubmitting(false);
          }}
        >
          {({ values, errors, setFieldValue, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="mb-2 inline-block text-sm">
                  Name
                </label>
                <Field
                  type="text"
                  name="name"
                  id="name"
                  className="mb-1 block w-full rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-gray-900 placeholder-black placeholder-opacity-75 transition focus:border-neutral-400 focus:outline-none"
                />
                <p className="text-sm text-critical-500">{errors.name}</p>
              </div>
              <div className="mb-4">
                <label htmlFor="flag" className="mb-2 inline-block text-sm">
                  Flag
                </label>
                <Field
                  type="text"
                  name="flag"
                  id="flag"
                  className="mb-1 block w-full rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-gray-900 placeholder-black placeholder-opacity-40 transition focus:border-neutral-400 focus:outline-none"
                  placeholder={task?.flag ? 'Exists' : ''}
                />
                <p className="text-sm text-critical-500">{errors.flag}</p>
              </div>
              <div className="mb-4">
                <label htmlFor="tags" className="mb-2 inline-block text-sm">
                  Tags
                </label>
                <TagsInput
                  name="tags"
                  value={values.tags}
                  onChange={(v) => setFieldValue('tags', v)}
                />
                <p className="text-sm text-critical-500">{errors.flag}</p>
                <p className="text-sm text-gray-500 mt-1">You need hit Enter to add a new tag.</p>
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="mb-2 inline-block text-sm">
                  Content
                </label>
                <Field
                  as="textarea"
                  name="content"
                  id="content"
                  type="text"
                  className="mb-1 block h-44 w-full rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-gray-900 placeholder-black placeholder-opacity-40 transition focus:border-neutral-400 focus:outline-none"
                />
                <p className="text-sm text-critical-500">{errors.content}</p>
              </div>
              <div className="mb-4">
                <label htmlFor="file" className="mb-2 inline-block text-sm">
                  File
                </label>
                <div className="mb-1 flex w-full justify-between rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-gray-900 placeholder-black placeholder-opacity-40 transition focus:border-neutral-400 focus:outline-none">
                  <input
                    id="file"
                    name="file"
                    type="file"
                    className="text-sm"
                    onInput={(e) => {
                      const { files } = e.target as HTMLInputElement;
                      if (!files?.length) return;

                      setFieldValue('file', files[0]);
                    }}
                  />
                  <span className="text-gray-400">
                    {task?.filePath ? 'Exists' : ''}
                  </span>
                </div>
                <p className="text-sm text-critical-500">{errors.file}</p>
              </div>
              <div className="mb-2 flex">
                <button
                  className="mr-2 block rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-sm text-gray-900 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 active:bg-neutral-200"
                  type="submit"
                >
                  {task ? 'Submit Changes' : 'Create Task'}
                </button>
                {task && (
                  <button
                    className="block rounded-md border border-red-500 bg-white py-2.5 px-3.5 text-sm text-red-500 transition hover:bg-red-600 hover:text-white focus:bg-red-500 focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:bg-red-700 active:text-white"
                    type="button"
                    onClick={async () => {
                      setIsOpen(true);
                    }}
                  >
                    Delete Task
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default TaskForm;
