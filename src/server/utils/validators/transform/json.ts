import { TransformFnParams } from 'class-transformer';

export const JSONParseTransform = (params: TransformFnParams) => {
  if (!params.value) {
    return undefined;
  }
  try {
    return JSON.parse(params.value);
  } catch (e) {
    return undefined;
  }
};
