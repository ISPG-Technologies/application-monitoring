import { TransformFnParams } from 'class-transformer';

export const BooleanTransform = (params: TransformFnParams) => {
  if (!params || params.value === undefined) {
    return undefined;
  }

  return Boolean(params.value);
};

export const BooleanQueryTransform = (params: TransformFnParams) => {
  if (!params || !params.value) {
    return undefined;
  }

  return params.value === 'true';
};
