import { TransformFnParams } from 'class-transformer';

const cleanHtml = (text: string) => {
  if (!text) {
    return text;
  }
  return text.replace(/(<([^>]+)>)/gi, '').replace(/&nbsp;/gi, '');
};

export const HtmlTransform = (params: TransformFnParams) => {
  if (!params || params.value === undefined) {
    return undefined;
  }
  if (params.value === null) {
    return null;
  }

  if (typeof params.value !== 'string') {
    return params.value;
  }

  return cleanHtml(params.value);
};
