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

export const createPersistStore = <T>(initialState: T, options: { persist: string }): Store<T> => {
  let state: T;

  const temp = localStorage.getItem(options.persist) as T;
  if (!temp) {
    state = initialState;
    localStorage.setItem(options.persist, JSON.stringify(state));
  } else {
    state = temp;
  }

  const getState = () => state;

  const listeners = new Set<() => void>();

  const setState = (fn: SetStateCallback<T>) => {
    state = fn(state);
    const persist = options?.persist;
    persist && localStorage.setItem(persist, JSON.stringify(state));

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

export const useValueStore = <T, U>(
  store: Store<T>,
  selector: (state: T) => U
): U => {
  const slice = useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.getState()), [store, selector])
  );

  return slice;
};

export const useSetStore = <T>(store: Store<T>): Store<T>['setState'] => {
  return store.setState;
};
