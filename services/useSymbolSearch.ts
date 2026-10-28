import {useEffect, useState} from 'react';
import {searchSymbols, SearchResult} from './marketData';

const DEBOUNCE_MS = 350;

// Debounced symbol search; ignores responses for queries the user has
// already typed past.
export const useSymbolSearch = (query: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      setFailed(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      searchSymbols(trimmed)
        .then(found => {
          if (!cancelled) {
            setResults(found);
            setFailed(false);
          }
        })
        .catch(() => !cancelled && setFailed(true))
        .finally(() => !cancelled && setSearching(false));
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  return {results, searching, failed, active: !!trimmed};
};
