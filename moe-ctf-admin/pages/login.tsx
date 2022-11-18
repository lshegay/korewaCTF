import { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Formik, Form, Field } from 'formik';

import { ky } from '@setup/ky';
import { auth } from '@store';
import * as jsend from '@utils/jsend';
import { User, UserRole } from '@utils/types';

const Page: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    ky.get('profile')
      .json<jsend.Response>()
      .then((response) => {
        if (response.status == jsend.Status.SUCCESS) {
          router.push('/');
        }
      })
      .catch(() => {});
  }, [router]);

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="flex h-full items-center justify-center">
        <div className="flex w-72 flex-col">
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-bold">Sign In</h1>
          </div>
          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            onSubmit={async (values, { setErrors, setSubmitting }) => {
              setSubmitting(true);

              const response = await ky
                .post('login', { json: values })
                .json<
                  jsend.Response<
                    { token: string; user: User },
                    Record<keyof User, string>
                  >
                >();

              if (
                response.status == jsend.Status.SUCCESS &&
                response.data?.token
              ) {
                if (
                  (response.data.user?.role ?? UserRole.GUEST) != UserRole.ADMIN
                ) {
                  setErrors({
                    email: 'You have no rights to access admin panel.',
                  });
                } else {
                  auth.setToken(response.data.token);
                  router.push('/');
                }
              } else {
                setErrors(response.data ?? {});
              }

              setSubmitting(false);
            }}
          >
            {({ submitForm, errors }) => (
              <Form className="flex flex-col">
                <Field
                  type="email"
                  id="email"
                  name="email"
                  aria-label="email"
                  className="mb-3 block w-full rounded-md bg-gray-100 py-2.5 px-3.5 text-gray-900 placeholder-black placeholder-opacity-75 transition focus:bg-gray-200 focus:outline-none"
                  placeholder="Email Address"
                />
                <Field
                  type="password"
                  id="password"
                  name="password"
                  aria-label="password"
                  className="mb-1 block w-full rounded-md bg-gray-100 py-2.5 px-3.5 text-gray-900 placeholder-black placeholder-opacity-75 transition focus:bg-gray-200 focus:outline-none"
                  placeholder="Password"
                />
                <p className="mb-3 text-sm text-critical-500">
                  {errors.email ?? errors.password}
                </p>
                <button
                  type="submit"
                  onClick={submitForm}
                  className="mr-2 block rounded-md border border-neutral-200 bg-white py-2.5 px-3.5 text-sm text-gray-900 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 active:bg-neutral-200"
                >
                  Sign In
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default Page;
