import { TransformFnParams } from 'class-transformer';
import { Types } from 'mongoose';

export const ObjectIdTransform = (params: TransformFnParams) => {
  if (!params || !params.value) {
    return undefined;
  }
  if (Types.ObjectId.isValid(params.value?.toString())) {
    return Types.ObjectId(params.value);
  }
  return undefined;
};

export const NullObjectIdTransform = (params: TransformFnParams) => {
  if (!params || params.value === undefined) {
    return undefined;
  }
  if (params.value === null) {
    return null;
  }
  if (Types.ObjectId.isValid(params.value)) {
    return Types.ObjectId(params.value);
  }
  return undefined;
};

export const ObjectIdListTransform = (params: TransformFnParams) => {
  if (!params || params.value === undefined) {
    return undefined;
  }
  if (Array.isArray(params.value)) {
    return params.value
      ?.map((value) => {
        if (Types.ObjectId.isValid(value)) {
          return Types.ObjectId(value);
        }
        return undefined;
      })
      .filter((id) => id);
  }

  return undefined;
};

export const NullableObjectIdListTransform = (params: TransformFnParams) => {
  if (!params || params.value === undefined) {
    return undefined;
  }
  if (Array.isArray(params.value)) {
    return params.value
      ?.map((value) => {
        if (value === null) {
          return null;
        }
        if (Types.ObjectId.isValid(value)) {
          return Types.ObjectId(value);
        }
        return undefined;
      })
      .filter((id) => id !== undefined);
  }

  return undefined;
};
