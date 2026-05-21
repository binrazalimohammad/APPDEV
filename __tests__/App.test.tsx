/**
 * @format
 */

jest.mock('../src/navigations', () => ({
  __esModule: true,
  default: () => null,
}));

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
