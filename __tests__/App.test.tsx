/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.useFakeTimers();

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  // Get past the onboarding splash delay.
  await ReactTestRenderer.act(() => {
    jest.runOnlyPendingTimers();
  });
  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});
