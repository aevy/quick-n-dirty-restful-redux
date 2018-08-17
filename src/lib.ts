import { IdType } from "./types";

export const assoc = (id: IdType, item: any, collection: any) => ({
  ...collection,
  [id]: item
});

export const indexBy = (indexField: string, items: any[]) =>
  items.reduce((acc, item) => assoc(item[indexField], item, acc), {});

export const dissoc = (id: any, items: Object) =>
  Object.keys(items)
    .filter(key => key != id)
    .reduce((acc, key) => assoc(key, items[key], acc), {});
