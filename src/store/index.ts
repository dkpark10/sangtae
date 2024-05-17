// type Setter<T> = (callback: (s: T) => T[keyof T]) => void;

// export const useStore = () => {

// }

// export const createStore = <T>(initValue: T): () => T & { setter: Setter<T> } => {
//   let state: T;

//   const listeners = new Set();

//   const subscribe = (listener: number) => {
//     listeners.add(listener);
//   };
//   subscribe(1);

//   const setter: Setter<T> = (callback: (s: T) => T[keyof T]) => {
//     callback(state);
//   };

//   return () => ({
//     ...initValue,
//     setter,
//   });
// };

// export const useCounterStore = createStore({
//   counter: 0,
// });

import { useCallback, useSyncExternalStore } from 'react';

type SetStateCallback<T> = (state: T) => T;

type Listener = () => void

type Store<T> = {
  getState: () => T;
  setState: (fn: SetStateCallback<T>) => void;
  subscribe: (listener: Listener) => () => boolean;
}

const createStore = <T>(initialState: T): Store<T> => {
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

export const useCounterStore = <T>(store: Store<T>, selector: (state: T) => T[keyof T]) => {
  return useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.getState()), [store, selector]),
  );
};

export const store = createStore<{ count: number }>({ count: 0 });
