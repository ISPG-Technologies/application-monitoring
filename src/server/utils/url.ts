import { join } from 'path';

export const mergeUrl = (baseUrl: string, relativePath: string) => {
  const oldPathName = new URL(baseUrl).pathname;
  const newRelativePath = join(oldPathName, relativePath);
  return new URL(newRelativePath, baseUrl).href;
};
