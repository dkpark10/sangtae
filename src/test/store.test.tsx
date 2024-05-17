import React from 'react';
import { expect, test } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useCounterStore, store } from '../store';

test('카운터', () => {
  function Counter() {
    const count = useCounterStore(
      store,
      (state) => state.count,
    );
  
    return (
      <React.Fragment>
        <button onClick={() => {
          store.setState((prev) => ({ count: prev.count + 1 }));
        }}>
          inc
        </button>
        <button onClick={() => {
          store.setState((prev) => ({ count: prev.count - 1 }));
        }}>
          dec
        </button>
        <h1>value: {count}</h1>
      </React.Fragment>
    )
  }
  
  const { getByText, getByRole } = render(<Counter />);
  fireEvent.click(getByText('inc'));
  expect(getByRole('heading', { level: 1 }).textContent).toBe('value: 1');

  fireEvent.click(getByText('dec'));
  expect(getByRole('heading', { level: 1 }).textContent).toBe('value: 0');
});
