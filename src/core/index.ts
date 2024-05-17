import { useCallback, useSyncExternalStore } from 'react';

type SetStateCallback<T> = (state: T) => T;

type Listener = () => void

type Store<T> = {
  getState: () => T;
  setState: (fn: SetStateCallback<T>) => void;
  subscribe: (listener: Listener) => () => boolean;
}

export const createStore = <T>(initialState: T): Store<T> => {
  let state: T = initialState;

  const getState = () => state;

  const listeners = new Set<Listener>();

  const setState = (fn: SetStateCallback<T>) => {
    state = fn(state);
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
};

export const useStore = <T>(store: Store<T>, selector: (state: T) => T[keyof T]) => {
  return useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.getState()), [store, selector]),
  );
};
