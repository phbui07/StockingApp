import type {ChartPoint} from './marketData';

// Simple technical indicators and how they "did" historically. These are
// statistics about the past, shown next to the base rate so it's clear how
// little they say about the future; the app never turns them into signals.

export const HORIZON_DAYS = 20; // trading days, roughly one month

export type IndicatorId =
  | 'aboveSma200'
  | 'smaCross'
  | 'rsiBelow30'
  | 'rsiAbove70'
  | 'drawdown10';

export const INDICATOR_IDS: IndicatorId[] = [
  'aboveSma200',
  'smaCross',
  'rsiBelow30',
  'rsiAbove70',
  'drawdown10',
];

export interface Outcome {
  samples: number; // days counted
  upRate: number; // % of those days the price was higher HORIZON days later
  avgReturn: number; // average HORIZON-day change, in %
}

export interface IndicatorRecord extends Outcome {
  id: IndicatorId;
  activeNow?: boolean; // whether the condition holds on the latest day
}

export interface TrackRecord {
  horizon: number;
  from: number;
  to: number;
  base: Outcome; // every day in the same window
  records: IndicatorRecord[];
}

export const sma = (values: number[], period: number) => {
  const out: (number | undefined)[] = new Array(values.length).fill(undefined);
  let sum = 0;
  values.forEach((value, i) => {
    sum += value;
    if (i >= period) {
      sum -= values[i - period];
    }
    if (i >= period - 1) {
      out[i] = sum / period;
    }
  });
  return out;
};

// Wilder's RSI: 0–100, comparing average gains to average losses.
export const rsi = (values: number[], period = 14) => {
  const out: (number | undefined)[] = new Array(values.length).fill(undefined);
  if (values.length <= period) {
    return out;
  }
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    gain += Math.max(change, 0);
    loss += Math.max(-change, 0);
  }
  gain /= period;
  loss /= period;
  const value = () => (loss === 0 ? 100 : 100 - 100 / (1 + gain / loss));
  out[period] = value();
  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    gain = (gain * (period - 1) + Math.max(change, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-change, 0)) / period;
    out[i] = value();
  }
  return out;
};

const rollingMax = (values: number[], period: number) =>
  values.map((_, i) =>
    i >= period - 1
      ? Math.max(...values.slice(i - period + 1, i + 1))
      : undefined,
  );

export const computeTrackRecord = (
  points: ChartPoint[],
  horizon = HORIZON_DAYS,
): TrackRecord | null => {
  const closes = points.map(point => point.value);
  const sma50 = sma(closes, 50);
  const sma200 = sma(closes, 200);
  const rsi14 = rsi(closes, 14);
  const high = rollingMax(closes, 252);

  const conditions: Record<IndicatorId, (i: number) => boolean | undefined> = {
    aboveSma200: i =>
      sma200[i] === undefined ? undefined : closes[i] > sma200[i]!,
    smaCross: i =>
      sma50[i] === undefined || sma200[i] === undefined
        ? undefined
        : sma50[i]! > sma200[i]!,
    rsiBelow30: i => (rsi14[i] === undefined ? undefined : rsi14[i]! < 30),
    rsiAbove70: i => (rsi14[i] === undefined ? undefined : rsi14[i]! > 70),
    drawdown10: i =>
      high[i] === undefined ? undefined : closes[i] <= high[i]! * 0.9,
  };

  // Every row uses the same window, from the first day all indicators exist
  // to the last day whose outcome is known, so they compare to one base rate.
  const start = 251;
  const end = closes.length - horizon;
  if (end - start < 30) {
    return null;
  }

  const tally = (include: (i: number) => boolean): Outcome => {
    let samples = 0;
    let up = 0;
    let total = 0;
    for (let i = start; i < end; i++) {
      if (!include(i)) {
        continue;
      }
      const change = closes[i + horizon] / closes[i] - 1;
      samples++;
      up += change > 0 ? 1 : 0;
      total += change;
    }
    return {
      samples,
      upRate: samples ? (up / samples) * 100 : 0,
      avgReturn: samples ? (total / samples) * 100 : 0,
    };
  };

  return {
    horizon,
    from: points[start].t,
    to: points[end - 1].t,
    base: tally(() => true),
    records: INDICATOR_IDS.map(id => ({
      id,
      ...tally(i => conditions[id](i) === true),
      activeNow: conditions[id](closes.length - 1),
    })),
  };
};
