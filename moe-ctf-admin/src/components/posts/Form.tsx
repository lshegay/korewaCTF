import { DetailedHTMLProps, HTMLAttributes, useState } from 'react';
import { useRouter } from 'next/router';
import { Field, Form, Formik } from 'formik';
import { serialize } from 'object-to-formdata';

import { ky } from '@setup/ky';
import Dialog from '@components/Dialog';
import { Post } from '@utils/types';
import * as jsend from '@utils/jsend';
import classNames from 'classnames';

export type Props = {
  post?: Partial<Post> | null;
  onSuccess: (v: Post) => void | Promise<void>;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const PostForm = ({ post, onSuccess, className }: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {post && (
        <Dialog
          title="Are you sure?"
          content="This will permanently delete your post."
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          controls={
            <>
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white placeholder-opacity-75 transition  hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:bg-red-700"
                onClick={async () => {
                  const response = await ky
                    .post('admin/deletePost', {
                      body: JSON.stringify({ id: post?.id }),
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
        className={classNames(
          'xt-card xt-links-default rounded-2xl bg-gray-100 p-7 text-base text-gray-900 sm:p-9',
          className,
        )}
      >
        <h5>Information</h5>
        <Formik
          initialValues={{
            id: post?.id,
            name: post?.name ?? '',
            content: post?.content ?? '',
          }}
          onSubmit={async (values, { setErrors, setSubmitting }) => {
            const formData = serialize(
              {
                ...values,
              },
              {
                nullsAsUndefineds: true,
              },
            );

            const response = await ky
              .post(post ? 'admin/updatePost' : 'admin/post', {
                body: formData,
              })
              .json<jsend.Response<Post, Record<keyof Post, string>>>();

            switch (response.status) {
              case jsend.Status.SUCCESS: {
                onSuccess(response.data as Post);
                break;
              }
              case jsend.Status.FAIL: {
                setErrors({
                  ...(response.data as Record<keyof Post, string>),
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
              {post?.created && (
                <div className="mb-4">
                  <label htmlFor="name" className="mb-2 inline-block text-sm">
                    Date Created
                  </label>
                  <p>
                    {new Intl.DateTimeFormat('default', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                    }).format(new Date(post.created))}
                  </p>
                </div>
              )}
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
              <div className="mb-2 flex">
                <button
                  className="mr-2 block rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-sm text-gray-900 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 active:bg-neutral-200"
                  type="submit"
                >
                  {post ? 'Submit Changes' : 'Create Post'}
                </button>
                {post && (
                  <button
                    className="block rounded-md border border-red-500 bg-white py-2.5 px-3.5 text-sm text-red-500 transition hover:bg-red-600 hover:text-white focus:bg-red-500 focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:bg-red-700 active:text-white"
                    type="button"
                    onClick={async () => {
                      setIsOpen(true);
                    }}
                  >
                    Delete Post
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

export default PostForm;
