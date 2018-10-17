import { IdType } from "./types";

export const assoc = (id: IdType, item: any, collection: any) => ({
  ...collection,
  [id]: item
});

export const indexBy = (indexField: string, items: any[]) =>
  items.reduce(
    (acc, item) => assoc(item[indexField], camelizeObject(item), acc),
    {}
  );

export const dissoc = (id: any, items: Object) =>
  Object.keys(items)
    .filter(key => key != id)
    .reduce((acc, key) => assoc(key, (items as any)[key], acc), {});

const camelize = (s: string) =>
  s
    .split("_")
    .map((part, idx) => {
      if (idx === 0) {
        return part;
      }
      return part.substr(0, 1).toUpperCase() + part.substr(1);
    })
    .join();

export const camelizeObject = (object: any) => {
  Object.keys(object).reduce(
    (acc, key) => ({
      ...acc,
      [camelize(key)]: object[key]
    }),
    {}
  );
};
