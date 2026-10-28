import {createAlert, findTriggered, isValidTarget} from '../services/alerts';
import type {Quote} from '../services/marketData';

const quote = (symbol: string, price: number) => ({symbol, price} as Quote);

it('picks the direction from the current price', () => {
  expect(createAlert('AAPL', 'Apple', 400, 350).direction).toBe('above');
  expect(createAlert('AAPL', 'Apple', 300, 350).direction).toBe('below');
});

it('fires only when the target is crossed', () => {
  const above = createAlert('AAPL', 'Apple', 400, 350);
  const below = createAlert('MSFT', 'Microsoft', 500, 530);
  const alerts = [above, below];
  expect(
    findTriggered(alerts, {AAPL: quote('AAPL', 399), MSFT: quote('MSFT', 501)}),
  ).toEqual([]);
  expect(
    findTriggered(alerts, new Map([['AAPL', quote('AAPL', 400)]])),
  ).toEqual([above]);
  expect(findTriggered(alerts, {MSFT: quote('MSFT', 499)})).toEqual([below]);
});

it('ignores alerts that already fired', () => {
  const fired = {...createAlert('AAPL', 'Apple', 400, 350), triggeredAt: 1};
  expect(findTriggered([fired], {AAPL: quote('AAPL', 500)})).toEqual([]);
});

it('validates targets', () => {
  expect(isValidTarget(400, 350)).toBe(true);
  expect(isValidTarget(350, 350)).toBe(false);
  expect(isValidTarget(0, 350)).toBe(false);
  expect(isValidTarget(NaN, 350)).toBe(false);
});
