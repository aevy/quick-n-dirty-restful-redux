export type IdType = string | number;

export type Base<T> = Partial<T> & { id: IdType };
