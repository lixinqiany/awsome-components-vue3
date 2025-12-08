export const isUndef = (value: unknown): value is undefined | null =>
  value === undefined || value === null;
