import React from 'react';
// import { useStore , createStore } from './core';
// import { useStore , createStore } from './core2';
import { create } from './zustand3';

type Data = {
  count: number;
}

type Setter = (arg0: (state: Data) => Data) => Data

const useStore = create((set: Setter) => ({
  count: 0,
  setCount: (volume: number) => set((state: Data) => ({ count: state.count + volume })),
}));

export default function App() {
  const { count, setCount } = useStore((state: Data) => state);

  return (
    <React.Fragment>
      <button
        onClick={() => {
          setCount(1);
        }}
      >
        increase
      </button>
      <button
        onClick={() => {
          setCount(-1);
        }}
      >
        decrease
      </button>
      <h1>value: {count}</h1>
    </React.Fragment>
  );
}
