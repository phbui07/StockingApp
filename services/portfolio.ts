import type {ChartPoint, Quote} from './marketData';

// Paper trading: orders fill instantly at the given price against a virtual
// cash balance. Everything here is pure so it can be unit tested.

export const DEFAULT_STARTING_CASH = 100000;
export const STARTING_CASH_OPTIONS = [10000, 50000, 100000, 1000000];

export interface Position {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
}

export type TradeSide = 'BUY' | 'SELL';

export interface Transaction {
  id: string;
  side: TradeSide;
  symbol: string;
  name: string;
  shares: number;
  price: number;
  total: number;
  realizedPnL?: number; // sells only
  date: number;
}

export interface Portfolio {
  startingCash: number;
  cash: number;
  positions: Record<string, Position>;
  transactions: Transaction[]; // newest first
  createdAt: number;
}

export type OrderErrorCode =
  | 'INVALID_QUANTITY'
  | 'INVALID_PRICE'
  | 'INSUFFICIENT_CASH'
  | 'INSUFFICIENT_SHARES';

export class OrderError extends Error {
  code: OrderErrorCode;
  constructor(code: OrderErrorCode) {
    super(code);
    this.code = code;
  }
}

export interface OrderInput {
  side: TradeSide;
  symbol: string;
  name: string;
  shares: number;
  price: number;
  date?: number;
  id?: string;
}

const cents = (value: number) => Math.round(value * 100) / 100;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export const createPortfolio = (
  startingCash = DEFAULT_STARTING_CASH,
  now = Date.now(),
): Portfolio => ({
  startingCash,
  cash: startingCash,
  positions: {},
  transactions: [],
  createdAt: now,
});

export const maxAffordableShares = (cash: number, price: number) =>
  price > 0 ? Math.floor(cash / price + 1e-9) : 0;

export const executeOrder = (
  portfolio: Portfolio,
  order: OrderInput,
): {portfolio: Portfolio; transaction: Transaction} => {
  const {side, symbol, name, shares, price} = order;
  if (!Number.isInteger(shares) || shares <= 0) {
    throw new OrderError('INVALID_QUANTITY');
  }
  if (!(price > 0)) {
    throw new OrderError('INVALID_PRICE');
  }

  const total = cents(shares * price);
  const positions = {...portfolio.positions};
  const existing = positions[symbol];
  let cash = portfolio.cash;
  let realizedPnL: number | undefined;

  if (side === 'BUY') {
    if (total > cash) {
      throw new OrderError('INSUFFICIENT_CASH');
    }
    const held = existing?.shares ?? 0;
    const newShares = held + shares;
    positions[symbol] = {
      symbol,
      name,
      shares: newShares,
      avgCost: ((existing?.avgCost ?? 0) * held + price * shares) / newShares,
    };
    cash = cents(cash - total);
  } else {
    if (!existing || existing.shares < shares) {
      throw new OrderError('INSUFFICIENT_SHARES');
    }
    realizedPnL = cents((price - existing.avgCost) * shares);
    const remaining = existing.shares - shares;
    if (remaining === 0) {
      delete positions[symbol];
    } else {
      positions[symbol] = {...existing, shares: remaining};
    }
    cash = cents(cash + total);
  }

  const date = order.date ?? Date.now();
  const transaction: Transaction = {
    id: order.id ?? `${date}-${Math.random().toString(36).slice(2, 8)}`,
    side,
    symbol,
    name,
    shares,
    price,
    total,
    realizedPnL,
    date,
  };
  return {
    portfolio: {
      ...portfolio,
      cash,
      positions,
      transactions: [transaction, ...portfolio.transactions],
    },
    transaction,
  };
};

export interface Holding {
  position: Position;
  quote?: Quote;
  price: number;
  value: number;
  cost: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
}

export const toHolding = (position: Position, quote?: Quote): Holding => {
  // Until a quote arrives, value the position at cost.
  const price = quote?.price ?? position.avgCost;
  const value = price * position.shares;
  const cost = position.avgCost * position.shares;
  const pnl = value - cost;
  return {
    position,
    quote,
    price,
    value,
    cost,
    pnl,
    pnlPercent: cost ? (pnl / cost) * 100 : 0,
    dayChange: quote ? quote.change * position.shares : 0,
  };
};

export const summarize = (
  portfolio: Portfolio,
  quotes: Record<string, Quote | undefined>,
) => {
  const holdings = Object.values(portfolio.positions).map(position =>
    toHolding(position, quotes[position.symbol]),
  );
  const holdingsValue = sum(holdings.map(h => h.value));
  const cost = sum(holdings.map(h => h.cost));
  const totalValue = portfolio.cash + holdingsValue;
  const dayChange = sum(holdings.map(h => h.dayChange));
  const previousValue = totalValue - dayChange;
  const totalReturn = totalValue - portfolio.startingCash;
  return {
    holdings,
    cash: portfolio.cash,
    holdingsValue,
    totalValue,
    unrealizedPnL: holdingsValue - cost,
    unrealizedPercent: cost ? ((holdingsValue - cost) / cost) * 100 : 0,
    gain: sum(holdings.filter(h => h.pnl > 0).map(h => h.pnl)),
    loss: -sum(holdings.filter(h => h.pnl < 0).map(h => h.pnl)),
    dayChange,
    dayChangePercent: previousValue ? (dayChange / previousValue) * 100 : 0,
    totalReturn,
    totalReturnPercent: portfolio.startingCash
      ? (totalReturn / portfolio.startingCash) * 100
      : 0,
  };
};

export const tradingStats = (transactions: Transaction[]) => {
  const sells = transactions.filter(t => t.side === 'SELL');
  const wins = sells.filter(t => (t.realizedPnL ?? 0) > 0).length;
  return {
    totalTrades: transactions.length,
    winRate: sells.length ? (wins / sells.length) * 100 : 0,
    realizedPnL: cents(sum(sells.map(t => t.realizedPnL ?? 0))),
  };
};

// Cumulative realized P&L at the end of each of the last `days` days.
export const realizedPnLSeries = (
  transactions: Transaction[],
  days = 7,
  now = Date.now(),
) => {
  const sells = transactions.filter(t => t.side === 'SELL');
  const series: {label: string; value: number}[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayEnd = new Date(now);
    dayEnd.setHours(24, 0, 0, 0);
    dayEnd.setDate(dayEnd.getDate() - i);
    const day = new Date(dayEnd.getTime() - 1);
    series.push({
      label: `${day.getDate()}/${day.getMonth() + 1}`,
      value: cents(
        sum(
          sells
            .filter(t => t.date < dayEnd.getTime())
            .map(t => t.realizedPnL ?? 0),
        ),
      ),
    });
  }
  return series;
};

// Symbols whose prices are needed to value the portfolio over time.
export const tradedSymbols = (portfolio: Portfolio) => [
  ...new Set(portfolio.transactions.map(t => t.symbol)),
];

// Replays the trades over `timeline`, valuing shares at each symbol's last
// known price at that moment (or the trade price before any data point).
export const portfolioHistory = (
  portfolio: Portfolio,
  prices: Record<string, ChartPoint[]>,
  timeline: number[],
): ChartPoint[] => {
  const trades = [...portfolio.transactions].sort((a, b) => a.date - b.date);
  const shares: Record<string, number> = {};
  const lastPrice: Record<string, number> = {};
  const cursors: Record<string, number> = {};
  let cash = portfolio.startingCash;
  let next = 0;

  return [...timeline]
    .sort((a, b) => a - b)
    .map(t => {
      while (next < trades.length && trades[next].date <= t) {
        const trade = trades[next++];
        const direction = trade.side === 'BUY' ? 1 : -1;
        cash -= direction * trade.total;
        shares[trade.symbol] =
          (shares[trade.symbol] ?? 0) + direction * trade.shares;
        if (lastPrice[trade.symbol] === undefined) {
          lastPrice[trade.symbol] = trade.price;
        }
      }
      let value = cash;
      for (const [symbol, count] of Object.entries(shares)) {
        const points = prices[symbol] ?? [];
        let cursor = cursors[symbol] ?? 0;
        while (cursor < points.length && points[cursor].t <= t) {
          lastPrice[symbol] = points[cursor].value;
          cursor++;
        }
        cursors[symbol] = cursor;
        value += count * (lastPrice[symbol] ?? 0);
      }
      return {t, value: cents(value)};
    });
};
