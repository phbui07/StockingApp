import type {Quote} from './marketData';

export type AlertDirection = 'above' | 'below';

export interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  direction: AlertDirection;
  target: number;
  createdAt: number;
  triggeredAt?: number;
  triggeredPrice?: number;
}

// The direction comes from where the target sits relative to today's price,
// so a new alert never fires immediately.
export const createAlert = (
  symbol: string,
  name: string,
  target: number,
  currentPrice: number,
  now = Date.now(),
): PriceAlert => ({
  id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
  symbol,
  name,
  direction: target > currentPrice ? 'above' : 'below',
  target,
  createdAt: now,
});

export const isValidTarget = (target: number, currentPrice: number) =>
  Number.isFinite(target) && target > 0 && target !== currentPrice;

export const hasCrossed = (alert: PriceAlert, price: number) =>
  alert.direction === 'above' ? price >= alert.target : price <= alert.target;

// Active alerts whose condition is met by the latest quotes.
export const findTriggered = (
  alerts: PriceAlert[],
  quotes: ReadonlyMap<string, Quote> | Record<string, Quote | undefined>,
) => {
  const lookup = (symbol: string) =>
    quotes instanceof Map
      ? quotes.get(symbol)
      : (quotes as Record<string, Quote | undefined>)[symbol];
  return alerts.filter(alert => {
    const quote = lookup(alert.symbol);
    return !alert.triggeredAt && !!quote && hasCrossed(alert, quote.price);
  });
};
