import React from 'react';
import { useStore , createStore } from './core';
import './App.css'

const counterStore = createStore<{ count: number }>({ count: 0 });

export default function App() {
  const [count, setState] = useStore(counterStore, (state) => state.count);

  return (
    <React.Fragment>
      <button onClick={() => {
        setState((prev) => ({ count: prev.count + 1 }));
      }}>
        increase
      </button>
      <button onClick={() => {
        setState((prev) => ({ count: prev.count - 1 }));
      }}>
        decrease
      </button>
      <h1>value: {count}</h1>
    </React.Fragment>
  )
}
