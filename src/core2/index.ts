import { useEffect, useLayoutEffect, useReducer, useRef } from 'react';

type SetStateCallback<T> = (state: T) => T;

type Store<T> = {
  getState: () => T;
  setState: (fn: SetStateCallback<T>) => void;
  subscribe: (listener: () => void) => void;
};

const isServer = typeof window === 'undefined';
const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;

const shallow = <T, U>(objA: T, objB: U) => {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i] as string) ||
      !Object.is(objA[keysA[i] as keyof T], objB[keysA[i] as keyof U])
    ) {
      return false;
    }
  }
  return true;
};

export const createStore = <T>(initialState: T): Store<T> => {
  let state: T = initialState;

  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (callback: (state: T) => T) => {
    state = callback(state);
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    // unsubscribe
    return () => listeners.delete(listener);
  };

  return { subscribe, getState, setState };
};

export const useStore = <T, S>(
  store: Store<T>,
  selector: (state: T) => S
): [S, (callback: (state: T) => T) => void] => {
  const [, forceRender] = useReducer((x) => x + 1, 0);

  const currentState = useRef<T>(store.getState());

  useIsomorphicLayoutEffect(() => {
    const listener = () => {
      const nextState = store.getState();
      if (!shallow(currentState.current, nextState)) {
        currentState.current = nextState;
        forceRender();
      }
    };

    return store.subscribe(listener);
  }, []);

  return [selector(store.getState()), store.setState];
};
