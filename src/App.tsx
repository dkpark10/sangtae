import React from 'react';
import { useCounterStore, store } from './store/index';
import './App.css'

export default function App() {
  const count = useCounterStore(
    store,
    (state) => state.count,
  );

  return (
    <React.Fragment>
      <button onClick={() => {
        store.setState((prev) => ({ count: prev.count + 1 }));
      }}>
        increase
      </button>
      <button onClick={() => {
        store.setState((prev) => ({ count: prev.count - 1 }));
      }}>
        decrease
      </button>
      <h1>value: {count}</h1>
    </React.Fragment>
  )
}
