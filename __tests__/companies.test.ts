import {COMPANY_ABOUT} from '../locales/companies';
import {MarketIndices, PopularStocks} from '../services/renderData';
import {DEFAULT_WATCHLIST} from '../services/userData';

it('has an About description in both languages for every featured symbol', () => {
  const featured = new Set([
    ...PopularStocks,
    ...DEFAULT_WATCHLIST,
    ...MarketIndices.map(index => index.symbol),
  ]);
  featured.forEach(symbol => {
    const about = COMPANY_ABOUT[symbol];
    expect([symbol, !!about]).toEqual([symbol, true]);
    expect(about.description.vi.length).toBeGreaterThan(40);
    expect(about.description.en.length).toBeGreaterThan(40);
    expect(about.since).toBeGreaterThan(1800);
  });
});
