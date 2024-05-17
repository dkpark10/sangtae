import { describe, expect, test } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useState } from 'react';

describe('useState', () => {
  test('카운터', () => {
    function Counter() {
      const [c, sc] = useState(0);
      return (
        <div>
          <button
            onClick={() => {
              sc(c + 1);
            }}
          >
            inc
          </button>
          <button
            onClick={() => {
              sc(c - 1);
            }}
          >
            dec
          </button>
          <h1>value: {c}</h1>
        </div>
      );
    }
    const { getByText, getByRole } = render(<Counter />);
    fireEvent.click(getByText('inc'));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('value: 1');

    fireEvent.click(getByText('dec'));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('value: 0');
  });

  test('리렌더링', () => {
    let renderCount = 0;

    function Counter() {
      const [c, sc] = useState(0);
      renderCount += 1;
      return (
        <div>
          <button
            onClick={() => {
              sc(c + 1);
            }}
          >
            inc
          </button>
          <button
            onClick={() => {
              sc(c);
            }}
          >
            dec
          </button>
          <h1>value: {c}</h1>
        </div>
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
});
