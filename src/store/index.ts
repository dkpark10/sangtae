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

type Store<T> = {
  getState: () => T;
  setState: (fn: any) => void;
  subscribe: (l: any) => () => boolean;
}

const createStore = <T>(initialState: T): Store<T> => {
  let state: T = initialState;

  const getState = () => state;

  const listeners = new Set();

  const setState = (fn: any) => {
    state = fn(state);
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: any) => {
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
