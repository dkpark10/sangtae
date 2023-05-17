import { useCallback, useSyncExternalStore } from 'react';

type SetStateCallback<T> = (state: T) => T;

type Store<T> = {
  getState: () => T;
  setState: (fn: SetStateCallback<T>) => void;
  subscribe: (listener: () => void) => () => boolean;
};

type UseStoreReturn<T, Selector> = [
  Selector,
  (fn: SetStateCallback<T>) => void
];

export const createStore = <T>(initialState: T): Store<T> => {
  let state: T = initialState;

  const getState = () => state;

  const listeners = new Set<() => void>();

  const setState = (fn: SetStateCallback<T>) => {
    state = fn(state);
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
};

export const useStore = <T, U>(
  store: Store<T>,
  selector: (state: T) => U,
): UseStoreReturn<T, ReturnType<typeof selector>> => {
  const slice = useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.getState()), [store, selector])
  );

  return [slice, store.setState];
};
