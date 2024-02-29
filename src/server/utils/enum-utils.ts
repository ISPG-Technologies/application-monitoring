export const enumToStringArray = (
  enumObject: Record<string | number, string | number>,
): string[] => {
  if (!enumObject) {
    throw new Error('Enum object is required');
  }
  return Object.values(enumObject).filter(
    (k) => typeof k === 'string',
  ) as string[];
};
