import {useCallback, useEffect, useSyncExternalStore} from 'react';
import {AppState} from 'react-native';
import {getQuotes, Quote} from './marketData';

export const REFRESH_INTERVAL_MS = 20000;

// Live quotes shared by every screen. Components declare the symbols they
// show with useQuotes(); the store fetches them in batches and polls every
// REFRESH_INTERVAL_MS while the app is in the foreground.

const quotes = new Map<string, Quote>();
const refCounts = new Map<string, number>();
const storeListeners = new Set<() => void>();
const updateListeners = new Set<(latest: ReadonlyMap<string, Quote>) => void>();

let version = 0;
let loading = false;
let failed = false;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const queued = new Set<string>();
let appActive = AppState.currentState !== 'background';

const emit = () => {
  version++;
  storeListeners.forEach(listener => listener());
};

export const refreshQuotes = async (symbols?: string[]) => {
  const wanted = symbols ?? [...refCounts.keys()];
  if (!wanted.length) {
    return;
  }
  loading = true;
  emit();
  try {
    const fresh = await getQuotes(wanted);
    Object.values(fresh).forEach(quote => quotes.set(quote.symbol, quote));
    failed = false;
    loading = false;
    emit();
    updateListeners.forEach(listener => listener(quotes));
  } catch {
    failed = true;
    loading = false;
    emit();
  }
};

// Collects symbols requested in the same tick into one network call.
const queueFetch = (symbols: string[]) => {
  symbols.forEach(symbol => queued.add(symbol));
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      const batch = [...queued];
      queued.clear();
      refreshQuotes(batch);
    }, 0);
  }
};

const syncPolling = () => {
  const shouldPoll = appActive && refCounts.size > 0;
  if (shouldPoll && !pollTimer) {
    pollTimer = setInterval(() => refreshQuotes(), REFRESH_INTERVAL_MS);
  } else if (!shouldPoll && pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};

AppState.addEventListener('change', state => {
  const wasActive = appActive;
  appActive = state === 'active';
  if (appActive && !wasActive) {
    refreshQuotes();
  }
  syncPolling();
});

const retain = (symbols: string[]) => {
  const missing: string[] = [];
  symbols.forEach(symbol => {
    refCounts.set(symbol, (refCounts.get(symbol) ?? 0) + 1);
    if (!quotes.has(symbol)) {
      missing.push(symbol);
    }
  });
  if (missing.length) {
    queueFetch(missing);
  }
  syncPolling();
};

const release = (symbols: string[]) => {
  symbols.forEach(symbol => {
    const count = (refCounts.get(symbol) ?? 1) - 1;
    if (count <= 0) {
      refCounts.delete(symbol);
    } else {
      refCounts.set(symbol, count);
    }
  });
  syncPolling();
};

const subscribe = (listener: () => void) => {
  storeListeners.add(listener);
  return () => {
    storeListeners.delete(listener);
  };
};

const getVersion = () => version;

export const useQuotes = (symbols: string[]) => {
  const key = [...new Set(symbols)].sort().join(',');

  useEffect(() => {
    const list = key ? key.split(',') : [];
    retain(list);
    return () => release(list);
  }, [key]);

  useSyncExternalStore(subscribe, getVersion);

  const result: Record<string, Quote | undefined> = {};
  symbols.forEach(symbol => {
    result[symbol] = quotes.get(symbol);
  });

  const refresh = useCallback(
    () => refreshQuotes(key ? key.split(',') : []),
    [key],
  );

  return {quotes: result, loading, error: failed, refresh};
};

export const useQuote = (symbol: string) => {
  const {quotes: result, ...rest} = useQuotes([symbol]);
  return {quote: result[symbol], ...rest};
};

export const getCachedQuote = (symbol: string) => quotes.get(symbol);

export const onQuotesUpdated = (
  listener: (latest: ReadonlyMap<string, Quote>) => void,
) => {
  updateListeners.add(listener);
  return () => {
    updateListeners.delete(listener);
  };
};

// Test helper: forget everything between tests.
export const resetQuoteStore = () => {
  quotes.clear();
  refCounts.clear();
  queued.clear();
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  loading = false;
  failed = false;
  emit();
};
