import { useReducer, useRef, useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

function createStore(createState) {
  let state;
  const listeners = new Set();

  const setState = (partial, replace) => {
    // TODO: Remove type assertion once https://github.com/microsoft/TypeScript/issues/37663 is resolved
    // https://github.com/microsoft/TypeScript/issues/37663#issuecomment-759728342
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    if (nextState !== state) {
      const previousState = state;
      state = replace ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  const getState = () => state;

  const subscribeWithSelector = (
    listener,
    selector = getState,
    equalityFn = Object.is
  ) => {
    console.warn('[DEPRECATED] Please use `subscribeWithSelector` middleware');
    let currentSlice = selector(state);
    function listenerToAdd() {
      const nextSlice = selector(state);
      if (!equalityFn(currentSlice, nextSlice)) {
        const previousSlice = currentSlice;
        listener((currentSlice = nextSlice), previousSlice);
      }
    }
    listeners.add(listenerToAdd);
    // Unsubscribe
    return () => listeners.delete(listenerToAdd);
  };

  const subscribe = (listener, selector, equalityFn) => {
    if (selector || equalityFn) {
      return subscribeWithSelector(listener, selector, equalityFn);
    }
    listeners.add(listener);
    // Unsubscribe
    return () => listeners.delete(listener);
  };

  const destroy = () => listeners.clear();
  const api = { setState, getState, subscribe, destroy };
  state = createState(setState, getState, api);
  return api;
}

export function create(createState) {
  const api =
    typeof createState === 'function' ? createStore(createState) : createState;

  const useStore = (selector = api.getState, equalityFn = Object.is) => {
    const [, forceUpdate] = useReducer((c) => c + 1, 0);

    const state = api.getState();
    const stateRef = useRef(state);
    const selectorRef = useRef(selector);
    const equalityFnRef = useRef(equalityFn);
    const erroredRef = useRef(false);

    const currentSliceRef = useRef();
    if (currentSliceRef.current === undefined) {
      currentSliceRef.current = selector(state);
    }

    let newStateSlice;
    let hasNewStateSlice = false;

    // The selector or equalityFn need to be called during the render phase if
    // they change. We also want legitimate errors to be visible so we re-run
    // them if they errored in the subscriber.
    if (
      stateRef.current !== state ||
      selectorRef.current !== selector ||
      equalityFnRef.current !== equalityFn ||
      erroredRef.current
    ) {
      // Using local variables to avoid mutations in the render phase.
      newStateSlice = selector(state);
      hasNewStateSlice = !equalityFn(currentSliceRef.current, newStateSlice);
    }

    // Syncing changes in useEffect.
    useIsomorphicLayoutEffect(() => {
      if (hasNewStateSlice) {
        currentSliceRef.current = newStateSlice;
      }
      stateRef.current = state;
      selectorRef.current = selector;
      equalityFnRef.current = equalityFn;
      erroredRef.current = false;
    });

    const stateBeforeSubscriptionRef = useRef(state);
    useIsomorphicLayoutEffect(() => {
      const listener = () => {
        try {
          const nextState = api.getState();
          const nextStateSlice = selectorRef.current(nextState);
          if (!equalityFnRef.current(currentSliceRef.current, nextStateSlice)) {
            stateRef.current = nextState;
            currentSliceRef.current = nextStateSlice;
            forceUpdate();
          }
        } catch (error) {
          erroredRef.current = true;
          forceUpdate();
        }
      };
      const unsubscribe = api.subscribe(listener);
      if (api.getState() !== stateBeforeSubscriptionRef.current) {
        listener(); // state has changed before subscription
      }
      return unsubscribe;
    }, []);

    const sliceToReturn = hasNewStateSlice
      ? newStateSlice
      : currentSliceRef.current;
    return sliceToReturn;
  };

  Object.assign(useStore, api);

  // For backward compatibility (No TS types for this)
  useStore[Symbol.iterator] = function () {
    console.warn(
      '[useStore, api] = create() is deprecated and will be removed in v4'
    );
    const items = [useStore, api];
    return {
      next() {
        const done = items.length <= 0;
        return { value: items.shift(), done };
      },
    };
  };

  return useStore;
}
