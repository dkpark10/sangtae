import React from 'react';
import { describe, expect, test } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useStore, createStore } from '../core2';

describe('외부 스토어', () => {
  test('카운터 원시 숫자', () => {
    const counterStore = createStore<number>(0);

    function Counter() {
      const [count, setState] = useStore(counterStore, (counter) => counter);

      return (
        <React.Fragment>
          <button
            onClick={() => {
              setState((prev) => prev + 1);
            }}
          >
            inc
          </button>
          <button
            onClick={() => {
              setState((prev) => prev - 1);
            }}
          >
            dec
          </button>
          <h1>value: {count}</h1>
        </React.Fragment>
      );
    }

    const { getByText, getByRole } = render(<Counter />);
    fireEvent.click(getByText('inc'));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('value: 1');

    fireEvent.click(getByText('dec'));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('value: 0');
  });

  test('카운터 객체', () => {
    const counterStore = createStore<{ count: number }>({ count: 0 });

    function Counter() {
      const [count, setState] = useStore(counterStore, (state) => state.count);

      return (
        <React.Fragment>
          <button
            onClick={() => {
              setState((prev) => ({ count: prev.count + 1 }));
            }}
          >
            inc
          </button>
          <button
            onClick={() => {
              setState((prev) => ({ count: prev.count - 1 }));
            }}
          >
            dec
          </button>
          <h1>value: {count}</h1>
        </React.Fragment>
      );
    }

    const { getByText, getByRole } = render(<Counter />);
    fireEvent.click(getByText('inc'));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('value: 1');

    fireEvent.click(getByText('dec'));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('value: 0');
  });

  test('형제간 상태 공유', () => {
    const store = createStore<{ count: number }>({ count: 0 });

    function Brother1() {
      const [count, setState] = useStore(store, (state) => state.count);

      return (
        <React.Fragment>
          <button
            onClick={() => {
              setState((prev) => ({ count: prev.count + 1 }));
            }}
          >
            inc
          </button>
          <button
            onClick={() => {
              setState((prev) => ({ count: prev.count - 1 }));
            }}
          >
            dec
          </button>
          <h1 data-testid="brother1">value: {count}</h1>
        </React.Fragment>
      );
    }

    function Brother2() {
      const [count] = useStore(store, (state) => state.count);

      return (
        <React.Fragment>
          <h1 data-testid="brother2">value: {count}</h1>
        </React.Fragment>
      );
    }

    function Parent() {
      return (
        <React.Fragment>
          <Brother1 />
          <Brother2 />
        </React.Fragment>
      );
    }

    const { getByText, getByTestId } = render(<Parent />);
    fireEvent.click(getByText('inc'));
    expect(getByTestId('brother1').textContent).toBe('value: 1');
    expect(getByTestId('brother2').textContent).toBe('value: 1');

    fireEvent.click(getByText('dec'));
    expect(getByTestId('brother1').textContent).toBe('value: 0');
    expect(getByTestId('brother2').textContent).toBe('value: 0');
  });
});

describe('리렌더링', () => {
  test('숫자', () => {
    const store = createStore(0);

    let renderCount = 0;
    function Counter() {
      const [count, setState] = useStore(store, (state) => state);
      renderCount += 1;
      return (
        <React.Fragment>
          <button
            onClick={() => {
              setState((prev) => prev + 1);
            }}
          >
            inc
          </button>
          <button
            onClick={() => {
              setState((prev) => prev);
            }}
          >
            dec
          </button>
          <h1>value: {count}</h1>
        </React.Fragment>
      );
    }

    const { getByText } = render(<Counter />);
    expect(renderCount).toBe(1);
    fireEvent.click(getByText('dec'));
    fireEvent.click(getByText('dec'));
    fireEvent.click(getByText('dec'));
    expect(renderCount).toBe(1);

    fireEvent.click(getByText('inc'));
    expect(renderCount).toBe(2);
  });

  test('객체1', () => {
    const store = createStore<{ value: { foo: number } }>({
      value: { foo: 12 },
    });

    let renderCount = 0;
    function Counter() {
      const [count, setState] = useStore(store, (state) => state.value);
      renderCount += 1;
      return (
        <React.Fragment>
          <button
            onClick={() => {
              setState((prev) => ({
                ...prev,
                value: {
                  foo: prev.value.foo + 1,
                },
              }));
            }}
          >
            inc
          </button>
          <button
            onClick={() => {
              setState((prev) => ({ ...prev }));
            }}
          >
            dec
          </button>
          <h1>value: {count.foo}</h1>
        </React.Fragment>
      );
    }

    const { getByText } = render(<Counter />);
    expect(renderCount).toBe(1);
    fireEvent.click(getByText('dec'));
    fireEvent.click(getByText('dec'));
    fireEvent.click(getByText('dec'));
    expect(renderCount).toBe(1);

    fireEvent.click(getByText('inc'));
    expect(renderCount).toBe(2);
  });

  test('객체2', () => {
    const store = createStore<{ value: number[] }>({
      value: [1, 2, 3],
    });

    let renderCount = 0;
    function Counter() {
      useStore(store, (state) => state.value);
      renderCount += 1;
      return (
        <React.Fragment>
          <button
            onClick={() => {
              store.setState((prev) => ({
                ...prev,
                value: prev.value.map((item) => item * 2),
              }));
            }}
          >
            inc
          </button>
          <button
            onClick={() => {
              store.setState((prev) => ({
                ...prev,
                value: prev.value,
              }));
            }}
          >
            dec
          </button>
        </React.Fragment>
      );
    }

    const { getByText } = render(<Counter />);
    expect(renderCount).toBe(1);
    fireEvent.click(getByText('inc'));
    fireEvent.click(getByText('inc'));
    fireEvent.click(getByText('inc'));
    expect(renderCount).toBe(4);

    fireEvent.click(getByText('dec'));
    expect(renderCount).toBe(4);
  });
});
