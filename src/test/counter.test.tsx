import { expect, test } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useState } from 'react';

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
