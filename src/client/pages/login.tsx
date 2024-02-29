import absoluteUrl from 'next-absolute-url';
import Router from 'next/router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getUserProfile } from '../lib/api';
import { StorageKeys } from '../lib/enums';

type FormValues = {
  username: string;
  password: string;
};

const Login = () => {
  useEffect(() => {
    const authToken = localStorage.getItem(StorageKeys.AccessToken);
    if (authToken) {
      const fetchUser = async (authToken) => {
        const user = await getUserProfile(authToken);
        if (user) {
          // TODO
        }
      };

      fetchUser(authToken);
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async ({ username, password }, context) => {
    const { origin } = absoluteUrl(context.req);
    const endPoint = `/api/auth/login`;
    const apiUrl = `${origin}${endPoint.startsWith('/') ? '' : '/'}${endPoint}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: {
        'Content-type': 'application/json',
      },
    });
    const data = await res.json();
    localStorage.setItem(StorageKeys.AccessToken, data.data.access_token);
    Router.push('/');
  };

  return (
    <>
      <div className="content-center flex flex-col justify-center items-center h-screen">
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/4 "
          onSubmit={handleSubmit(onSubmit)}
        >
          <p className="text-green-700 text-xl mb-3 text-center uppercase">
            Login
          </p>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="textbox"
              placeholder="Username"
              id="username"
              {...register('username', {
                required: 'Username is required.',
              })}
            />
            {errors?.username && (
              <p className="text-red-500 text-xs ">{errors.username.message}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              className="shadow appearance-none border border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="password"
              {...register('password', {
                required: 'Password is required',
              })}
            />
            {errors?.password && (
              <p className="text-red-500 text-xs ">{errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <input
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              value=" Sign In"
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
