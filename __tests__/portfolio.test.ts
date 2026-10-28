import {
  createPortfolio,
  executeOrder,
  maxAffordableShares,
  OrderError,
  Portfolio,
  portfolioHistory,
  realizedPnLSeries,
  summarize,
  tradingStats,
} from '../services/portfolio';
import type {Quote} from '../services/marketData';

const quote = (
  symbol: string,
  price: number,
  previousClose = price,
): Quote => ({
  symbol,
  name: symbol,
  type: 'EQUITY',
  currency: 'USD',
  exchange: 'NasdaqGS',
  price,
  previousClose,
  change: price - previousClose,
  changePercent: ((price - previousClose) / previousClose) * 100,
  marketOpen: true,
  updatedAt: 0,
  spark: [],
});

const buy = (
  p: Portfolio,
  symbol: string,
  shares: number,
  price: number,
  date = 1,
) =>
  executeOrder(p, {side: 'BUY', symbol, name: symbol, shares, price, date})
    .portfolio;
const sell = (
  p: Portfolio,
  symbol: string,
  shares: number,
  price: number,
  date = 2,
) =>
  executeOrder(p, {side: 'SELL', symbol, name: symbol, shares, price, date})
    .portfolio;

describe('executeOrder', () => {
  it('buys shares with cash and averages the cost', () => {
    let p = createPortfolio(10000, 0);
    p = buy(p, 'AAPL', 10, 100);
    p = buy(p, 'AAPL', 10, 200);
    expect(p.cash).toBe(7000);
    expect(p.positions.AAPL.shares).toBe(20);
    expect(p.positions.AAPL.avgCost).toBe(150);
    expect(p.transactions).toHaveLength(2);
    expect(p.transactions[0].price).toBe(200); // newest first
  });

  it('records realized P&L on sells and closes empty positions', () => {
    let p = buy(createPortfolio(10000, 0), 'AAPL', 10, 100);
    p = sell(p, 'AAPL', 4, 130);
    expect(p.cash).toBe(9520);
    expect(p.positions.AAPL.shares).toBe(6);
    expect(p.transactions[0].realizedPnL).toBe(120);
    p = sell(p, 'AAPL', 6, 90);
    expect(p.positions.AAPL).toBeUndefined();
    expect(p.transactions[0].realizedPnL).toBe(-60);
    expect(p.cash).toBe(10060);
  });

  it('rejects orders it cannot fill', () => {
    const p = createPortfolio(1000, 0);
    const attempt = (order: Partial<Parameters<typeof executeOrder>[1]>) => {
      try {
        executeOrder(p, {
          side: 'BUY',
          symbol: 'X',
          name: 'X',
          shares: 1,
          price: 10,
          ...order,
        });
      } catch (error) {
        return (error as OrderError).code;
      }
    };
    expect(attempt({shares: 0})).toBe('INVALID_QUANTITY');
    expect(attempt({shares: 1.5})).toBe('INVALID_QUANTITY');
    expect(attempt({price: 0})).toBe('INVALID_PRICE');
    expect(attempt({shares: 101})).toBe('INSUFFICIENT_CASH');
    expect(attempt({side: 'SELL'})).toBe('INSUFFICIENT_SHARES');
  });

  it('does not mutate the original portfolio', () => {
    const p = createPortfolio(1000, 0);
    buy(p, 'AAPL', 1, 100);
    expect(p.cash).toBe(1000);
    expect(p.positions).toEqual({});
  });
});

it('maxAffordableShares rounds down without float drift', () => {
  expect(maxAffordableShares(1000, 100)).toBe(10);
  expect(maxAffordableShares(0.3, 0.1)).toBe(3);
  expect(maxAffordableShares(99.99, 100)).toBe(0);
  expect(maxAffordableShares(100, 0)).toBe(0);
});

describe('summarize', () => {
  it('values holdings at live prices', () => {
    let p = buy(createPortfolio(10000, 0), 'AAPL', 10, 100);
    p = buy(p, 'MSFT', 5, 200);
    const s = summarize(p, {
      AAPL: quote('AAPL', 110, 105),
      MSFT: quote('MSFT', 180, 190),
    });
    expect(s.cash).toBe(8000);
    expect(s.holdingsValue).toBe(1100 + 900);
    expect(s.totalValue).toBe(10000);
    expect(s.gain).toBe(100);
    expect(s.loss).toBe(100);
    expect(s.unrealizedPnL).toBe(0);
    expect(s.dayChange).toBe(10 * 5 + 5 * -10);
    expect(s.totalReturn).toBe(0);
  });

  it('falls back to cost while a quote is missing', () => {
    const p = buy(createPortfolio(10000, 0), 'AAPL', 10, 100);
    const s = summarize(p, {});
    expect(s.totalValue).toBe(10000);
    expect(s.holdings[0].pnl).toBe(0);
  });
});

it('tradingStats counts wins among sells', () => {
  let p = buy(createPortfolio(10000, 0), 'AAPL', 10, 100);
  p = sell(p, 'AAPL', 2, 120);
  p = sell(p, 'AAPL', 2, 90);
  p = sell(p, 'AAPL', 2, 130);
  const stats = tradingStats(p.transactions);
  expect(stats.totalTrades).toBe(4);
  expect(stats.winRate).toBeCloseTo(66.67, 1);
  expect(stats.realizedPnL).toBe(40 - 20 + 60);
});

it('realizedPnLSeries accumulates by day', () => {
  const now = new Date(2026, 9, 27, 15).getTime();
  const day = 24 * 60 * 60 * 1000;
  let p = buy(createPortfolio(10000, 0), 'AAPL', 10, 100, now - 5 * day);
  p = sell(p, 'AAPL', 5, 110, now - 3 * day);
  p = sell(p, 'AAPL', 5, 90, now - 1000);
  const series = realizedPnLSeries(p.transactions, 7, now);
  expect(series).toHaveLength(7);
  expect(series[6].label).toBe('27/10');
  expect(series.map(s => s.value)).toEqual([0, 0, 0, 50, 50, 50, 0]);
});

it('portfolioHistory replays trades over the timeline', () => {
  let p = createPortfolio(1000, 0);
  p = buy(p, 'AAPL', 5, 100, 15); // between t=10 and t=20
  const prices = {
    AAPL: [
      {t: 10, value: 100},
      {t: 20, value: 110},
      {t: 30, value: 120},
    ],
  };
  const history = portfolioHistory(p, prices, [10, 20, 30]);
  expect(history.map(h => h.value)).toEqual([1000, 1050, 1100]);
});

it('portfolioHistory uses the trade price before any data point', () => {
  const p = buy(createPortfolio(1000, 0), 'NEW', 2, 50, 5);
  const history = portfolioHistory(p, {NEW: []}, [10]);
  expect(history[0].value).toBe(1000);
});
