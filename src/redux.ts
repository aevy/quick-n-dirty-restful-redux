import { AnyAction, Reducer } from "redux";
import { Dispatch } from "react-redux";
import { Base, IdType } from "./types";
import { ResourceApi } from "./api";
import { assoc, indexBy, dissoc } from "./lib";

type ReducerFunction<T> = (state: T, ...args: any[]) => T;

export const createReducer = <State>(
  defaultState: State,
  actions: ReducerMap<State>
): Reducer<State> => (state: State | undefined, action: AnyAction) =>
  (actions[action.type] || (x => x))(
    state === undefined ? defaultState : state,
    action.payload
  );

export type ReducerMap<State> = {
  [actionType: string]: ReducerFunction<State>;
};

export const createResourceActions = <State, T>(
  resourceApi: ResourceApi<T>
) => {
  const { entityName, resource } = resourceApi.getConfig();
  const reduxNamespace = resource.toUpperCase();
  return {
    index: () => (dispatch: Dispatch<State>) =>
      resourceApi.index().then(data => {
        dispatch({
          type: `INDEX_${reduxNamespace}`,
          payload: data
        });
        return data;
      }),
    show: (id: string) => (dispatch: Dispatch<State>) =>
      resourceApi.show(id).then(data => {
        dispatch({
          type: `SHOW_${reduxNamespace}`,
          payload: data
        });
        return data;
      }),
    create: (newItem: Partial<T>) => (dispatch: Dispatch<State>) =>
      resourceApi.create({ [entityName]: newItem }).then(data => {
        dispatch({
          type: `CREATE_${reduxNamespace}`,
          payload: data
        });
        return data;
      }),
    update: (update: Base<T>) => (dispatch: Dispatch<State>) =>
      resourceApi.update({ [entityName]: update }).then(() => {
        dispatch({
          type: `UPDATE_${reduxNamespace}`,
          payload: update
        });
        return update;
      }),
    destroy: (id: string) => (dispatch: Dispatch<State>) =>
      resourceApi.destroy(id).then(() => {
        dispatch({
          type: `DESTROY_${reduxNamespace}`,
          payload: id
        });
        return id;
      })
  };
};

export const createResourceReducer = <Collection extends Object, Item>(
  resourceName: string,
  indexField?: string
): ReducerMap<Collection> => {
  const namespace = resourceName.toUpperCase();
  const getIndex = (x: Base<Item>) =>
    (indexField && (x as any)[indexField]) || x["id"];
  return {
    [`CREATE_${namespace}`]: (state: Collection, newItem: Base<Item>) =>
      assoc(newItem.id, newItem, state),
    [`INDEX_${namespace}`]: (_state: Collection, items: Item[]) =>
      indexBy(indexField || "id", items) as Collection,
    [`SHOW_${namespace}`]: (state, item: Base<Item>) =>
      assoc(getIndex(item), item, state),
    [`UPDATE_${namespace}`]: (state, update: Base<Item>) => ({
      ...(state as object),
      [getIndex(update)]: update
    }),
    [`DESTROY_${namespace}`]: (state, id: string) => dissoc(id, state)
  };
};
