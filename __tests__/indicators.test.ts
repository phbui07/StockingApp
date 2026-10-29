import {computeTrackRecord, rsi, sma} from '../services/indicators';

const series = (values: number[]) =>
  values.map((value, i) => ({t: i * 86400000, value}));

it('computes simple moving averages', () => {
  expect(sma([1, 2, 3, 4, 5], 2)).toEqual([undefined, 1.5, 2.5, 3.5, 4.5]);
});

it('computes RSI at the extremes and in balance', () => {
  const up = Array.from({length: 30}, (_, i) => 100 + i);
  const down = Array.from({length: 30}, (_, i) => 100 - i);
  const flat = Array.from({length: 30}, (_, i) => (i % 2 ? 101 : 100));
  expect(rsi(up).at(-1)).toBe(100);
  expect(rsi(down).at(-1)).toBe(0);
  // Equal-sized ups and downs hover around 50.
  expect(Math.abs(rsi(flat).at(-1)! - 50)).toBeLessThan(5);
  expect(rsi(up)[13]).toBeUndefined();
});

it('needs enough history', () => {
  expect(computeTrackRecord(series(Array(290).fill(100)))).toBeNull();
});

it('reports how often the price rose after each condition', () => {
  const rising = computeTrackRecord(
    series(Array.from({length: 400}, (_, i) => 100 + i)),
  )!;
  expect(rising.base.upRate).toBe(100);
  const byId = Object.fromEntries(rising.records.map(r => [r.id, r]));
  expect(byId.aboveSma200).toMatchObject({
    activeNow: true,
    upRate: 100,
    samples: rising.base.samples,
  });
  expect(byId.rsiBelow30.samples).toBe(0);
  expect(byId.drawdown10).toMatchObject({samples: 0, activeNow: false});
});

it('detects a drawdown from the 1-year high', () => {
  const values = [...Array(300).fill(100), ...Array(100).fill(85)];
  const record = computeTrackRecord(series(values))!;
  const drawdown = record.records.find(r => r.id === 'drawdown10')!;
  expect(drawdown.activeNow).toBe(true);
  expect(drawdown.samples).toBeGreaterThan(0);
  expect(drawdown.avgReturn).toBe(0);
});
