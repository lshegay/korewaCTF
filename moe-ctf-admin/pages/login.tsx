import { NextPage } from 'next';
import { Formik, Form, Field } from 'formik';
import { ky } from '@setup/ky';

const Page: NextPage = () => {
  return (
    <div className="flex h-screen w-screen justify-center items-center ">
      <div className="flex flex-col w-64">
        <div className="text-center mb-5">
          <h1 className="font-bold text-2xl">Sign In</h1>
        </div>
        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
          onSubmit={async (values) => {
            const response = await ky
              .post('login', { json: values })
              .json<any>();

            if (response.status == 'success') {
              console.log(response);
            } else {
            }
          }}
        >
          {({ submitForm }) => (
            <Form className="flex flex-col">
              <Field
                type="text"
                id="email"
                name="email"
                className="input input-bordered w-full mb-4"
                placeholder="Email Adress"
              />
              <Field
                type="password"
                id="password"
                name="password"
                className="input input-bordered w-full mb-8"
                placeholder="Password"
              />
              <button type="submit" onClick={submitForm} className="btn">
                Sign In
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Page;
