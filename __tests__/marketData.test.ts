import {
  clearMarketDataCache,
  getChart,
  getCompanyInfo,
  getNews,
  getQuotes,
  isTradable,
  logoUrl,
  parseQuote,
  searchSymbols,
} from '../services/marketData';

// Trimmed copies of real Yahoo Finance responses.
const meta = (
  symbol: string,
  price: number,
  previousClose: number,
  extra = {},
) => ({
  symbol,
  currency: 'USD',
  instrumentType: 'EQUITY',
  fullExchangeName: 'NasdaqGS',
  longName: `${symbol} Inc.`,
  regularMarketPrice: price,
  previousClose,
  chartPreviousClose: previousClose,
  regularMarketTime: 1793130940,
  currentTradingPeriod: {regular: {start: 1793107800, end: 1793131200}},
  ...extra,
});

const json = (body: unknown, status = 200) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () =>
      Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  } as Response);

const fetchMock = jest.fn();
beforeEach(() => {
  clearMarketDataCache();
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as any;
});

it('parseQuote computes change and market hours', () => {
  const q = parseQuote(
    meta('AAPL', 110, 100),
    [100, null, 105, 110],
    1793120000 * 1000,
  );
  expect(q.change).toBe(10);
  expect(q.changePercent).toBe(10);
  expect(q.spark).toEqual([100, 105, 110]);
  expect(q.marketOpen).toBe(true);
  expect(q.name).toBe('AAPL Inc.');
  expect(
    parseQuote(meta('AAPL', 110, 100), [], 1793140000 * 1000).marketOpen,
  ).toBe(false);
});

it('getQuotes batches 20 symbols per request and skips bad entries', async () => {
  const symbols = Array.from({length: 25}, (_, i) => `S${i}`);
  fetchMock.mockImplementation((url: string) => {
    const requested = decodeURIComponent(
      url.split('symbols=')[1].split('&')[0],
    ).split(',');
    return json({
      spark: {
        result: requested.map(symbol =>
          symbol === 'S3'
            ? {symbol, response: [{meta: {symbol}}]}
            : {
                symbol,
                response: [
                  {
                    meta: meta(symbol, 10, 9),
                    indicators: {quote: [{close: [9, 10]}]},
                  },
                ],
              },
        ),
      },
    });
  });
  const quotes = await getQuotes(symbols);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(Object.keys(quotes)).toHaveLength(24);
  expect(quotes.S0.price).toBe(10);
  expect(quotes.S3).toBeUndefined();
});

it('encodes index symbols', async () => {
  fetchMock.mockReturnValue(json({spark: {result: []}}));
  await getQuotes(['^GSPC']);
  expect(fetchMock.mock.calls[0][0]).toContain('symbols=%5EGSPC&');
});

it('getChart drops missing points and caches', async () => {
  fetchMock.mockReturnValue(
    json({
      chart: {
        result: [
          {
            meta: meta('AAPL', 12, 10, {chartPreviousClose: 8}),
            timestamp: [1, 2, 3],
            indicators: {quote: [{close: [10, null, 12]}]},
          },
        ],
      },
    }),
  );
  const day = await getChart('AAPL', '1D');
  expect(day.points).toEqual([
    {t: 1000, value: 10},
    {t: 3000, value: 12},
  ]);
  expect(day.baseline).toBe(10);
  await getChart('AAPL', '1D');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const year = await getChart('AAPL', '1Y');
  expect(year.baseline).toBe(8);
  expect(fetchMock.mock.calls[1][0]).toContain('range=1y&interval=1d');
});

it('searchSymbols keeps tradable types', async () => {
  fetchMock.mockReturnValue(
    json({
      quotes: [
        {
          symbol: 'TSLA',
          longname: 'Tesla, Inc.',
          exchDisp: 'NASDAQ',
          quoteType: 'EQUITY',
        },
        {symbol: 'TSLA250117C', shortname: 'Option', quoteType: 'OPTION'},
        {
          symbol: 'TSLL',
          shortname: 'Direxion',
          exchDisp: 'NYSEArca',
          quoteType: 'ETF',
        },
      ],
    }),
  );
  expect(await searchSymbols('  tesla ')).toEqual([
    {symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'EQUITY'},
    {symbol: 'TSLL', name: 'Direxion', exchange: 'NYSEArca', type: 'ETF'},
  ]);
  expect(await searchSymbols('   ')).toEqual([]);
});

it('getNews maps headlines', async () => {
  fetchMock.mockReturnValue(
    json({
      news: [
        {
          uuid: 'n1',
          title: 'Apple ships',
          publisher: 'Reuters',
          link: 'https://example.com/a',
          providerPublishTime: 100,
          thumbnail: {
            resolutions: [
              {url: 'big', tag: 'original'},
              {url: 'small', tag: '140x140'},
            ],
          },
        },
        {uuid: 'n2', title: 'No link'},
      ],
    }),
  );
  expect(await getNews('AAPL')).toEqual([
    {
      id: 'n1',
      title: 'Apple ships',
      publisher: 'Reuters',
      link: 'https://example.com/a',
      publishedAt: 100000,
      thumbnail: 'small',
    },
  ]);
});

it('getCompanyInfo fetches a crumb and retries once when it expires', async () => {
  const summary = {
    quoteSummary: {
      result: [
        {
          assetProfile: {
            website: 'https://www.apple.com',
            fullTimeEmployees: 150000,
            city: 'Cupertino',
            state: 'CA',
            country: 'United States',
            sector: 'Technology',
            industry: 'Consumer Electronics',
            longBusinessSummary: 'Apple designs phones.',
            companyOfficers: [{name: 'Tim Cook', title: 'CEO'}],
          },
          summaryDetail: {
            marketCap: {raw: 5e12},
            trailingPE: {raw: 39.8},
            dividendYield: {raw: 0.0031},
          },
          earnings: {
            financialsChart: {
              yearly: [
                {date: 2025, revenue: {raw: 4e11}, earnings: {raw: 1e11}},
              ],
            },
          },
        },
      ],
    },
  };
  let summaryCalls = 0;
  fetchMock.mockImplementation((url: string) => {
    if (url.includes('fc.yahoo.com')) {
      return json('', 404);
    }
    if (url.includes('getcrumb')) {
      return json('crumb123');
    }
    summaryCalls++;
    return summaryCalls === 1 ? json({}, 401) : json(summary);
  });
  const info = await getCompanyInfo('AAPL');
  expect(summaryCalls).toBe(2);
  expect(fetchMock.mock.calls.at(-1)[0]).toContain('crumb=crumb123');
  expect(info).toMatchObject({
    website: 'apple.com',
    employees: 150000,
    headquarters: 'Cupertino, CA, United States',
    sector: 'Technology · Consumer Electronics',
    leader: 'Tim Cook (CEO)',
    marketCap: 5e12,
    peRatio: 39.8,
    financials: [{year: 2025, revenue: 4e11, earnings: 1e11}],
  });
});

it('logos and tradability', () => {
  expect(logoUrl('AAPL')).toContain('/AAPL.png');
  expect(logoUrl('BRK-B')).toContain('/BRK-B.png');
  expect(logoUrl('^GSPC')).toBeUndefined();
  expect(logoUrl('VCB.VN')).toBeUndefined();
  const base = parseQuote(meta('AAPL', 1, 1));
  expect(isTradable(base)).toBe(true);
  expect(isTradable({...base, type: 'INDEX'})).toBe(false);
  expect(isTradable({...base, currency: 'VND'})).toBe(false);
  expect(isTradable(undefined)).toBe(false);
});
