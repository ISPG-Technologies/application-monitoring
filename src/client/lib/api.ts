import { NextPageContext } from 'next';
import absoluteUrl from 'next-absolute-url';
import { User } from '../../server/entities';

export const fetchServerResponse = async <T = any>(
  context: NextPageContext,
  endPoint: string,
): Promise<T> => {
  const { origin } = absoluteUrl(context.req);
  const apiUrl = `${origin}${endPoint.startsWith('/') ? '' : '/'}${endPoint}`;

  const res = await fetch(apiUrl);
  const json = await res.json();
  return json;
};

export const getUserProfile = async (token: string): Promise<User> => {
  const res = await fetch('/api/auth/profile', {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
  });
  const json = await res.json();
  return json.data;
};

export const postAndUpdateServerResponse = async <T = any>(
  origin: string,
  endPoint: string,
  type: string,
  data: string,
  authToken: string,
): Promise<T> => {
  const apiUrl = `${origin}${endPoint.startsWith('/') ? '' : '/'}${endPoint}`;

  const res = await fetch(apiUrl, {
    method: type,
    body: data,
    headers: {
      'Content-type': 'application/json',
      Authorization: 'Bearer ' + authToken,
    },
  });

  const json = await res.json();
  return json;
};
