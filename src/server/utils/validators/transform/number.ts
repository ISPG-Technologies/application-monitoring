import { TransformFnParams } from 'class-transformer';

export const IntTransform = (params: TransformFnParams) => {
  if (!params || !params.value) {
    return undefined;
  }
  return parseInt(params.value, 10);
};

export const NumberTransform = (params: TransformFnParams) => {
  if (!params || !params.value) {
    return undefined;
  }
  return Number(params.value);
};
