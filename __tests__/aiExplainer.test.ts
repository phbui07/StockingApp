import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AiError,
  buildPrompt,
  explainStock,
  findAdvice,
  GEMINI_MODELS,
  sanitize,
  saveApiKey,
} from '../services/aiExplainer';
import {clearMarketDataCache} from '../services/marketData';

const explanation = (overrides = {}) => ({
  summary: 'Apple designs phones. Its revenue grew 2.5% last year.',
  priceAction: 'The price rose 10% over a year, more than the S&P 500.',
  valuation: 'A P/E of 39.8 means investors pay $39.80 per $1 of profit.',
  news: 'Headlines covered new products.',
  positives: ['Strong brand'],
  risks: ['Depends on iPhone sales'],
  questions: ['How much revenue comes from services?'],
  terms: [{term: 'P/E', meaning: 'Price divided by earnings per share.'}],
  ...overrides,
});

const respond = (body: unknown, status = 200) =>
  Promise.resolve({
    ok: status < 400,
    status,
    json: () => Promise.resolve(body),
    text: () =>
      Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  } as Response);

const gemini = (content: unknown) =>
  respond({
    candidates: [
      {
        content: {parts: [{text: JSON.stringify(content)}]},
        finishReason: 'STOP',
      },
    ],
  });

const meta = (symbol: string) => ({
  symbol,
  currency: 'USD',
  instrumentType: 'EQUITY',
  longName: `${symbol} Inc.`,
  regularMarketPrice: 110,
  previousClose: 100,
});

let geminiReplies: (() => Promise<Response>)[] = [];
const geminiCalls: {model: string; body: string}[] = [];

const fetchMock = jest.fn((url: string, init?: RequestInit) => {
  if (url.includes('generativelanguage')) {
    geminiCalls.push({
      model: url.split('/models/')[1].split(':')[0],
      body: String(init?.body),
    });
    return geminiReplies.shift()!();
  }
  if (url.includes('/v7/finance/spark')) {
    const symbols = decodeURIComponent(url.split('symbols=')[1].split('&')[0]);
    return respond({
      spark: {
        result: symbols.split(',').map(symbol => ({
          symbol,
          response: [{meta: meta(symbol), indicators: {quote: [{close: []}]}}],
        })),
      },
    });
  }
  if (url.includes('/v8/finance/chart/')) {
    return respond({
      chart: {
        result: [
          {
            meta: meta('X'),
            timestamp: [1, 2, 3],
            indicators: {quote: [{close: [100, 105, 110]}]},
          },
        ],
      },
    });
  }
  if (url.includes('/v1/finance/search')) {
    return respond({
      news: [
        {
          uuid: 'n',
          title: 'Apple ships',
          publisher: 'Reuters',
          link: 'https://x',
          providerPublishTime: 1,
        },
      ],
    });
  }
  return respond('Too Many Requests', 429); // crumb / profile unavailable
});

beforeEach(async () => {
  await AsyncStorage.clear();
  clearMarketDataCache();
  geminiReplies = [];
  geminiCalls.length = 0;
  fetchMock.mockClear();
  globalThis.fetch = fetchMock as any;
});

describe('findAdvice', () => {
  it('flags recommendations in English and Vietnamese', () => {
    expect(findAdvice('You should buy this stock.')).toEqual(['You should']);
    expect(findAdvice('Analysts set a price target of $300.')).toHaveLength(1);
    expect(findAdvice('Now is a good time to buy.')).toHaveLength(1);
    expect(findAdvice('Bạn nên mua cổ phiếu này.').length).toBeGreaterThan(0);
    expect(findAdvice('Giá mục tiêu là 300 USD.')).toHaveLength(1);
    expect(findAdvice('Đây là thời điểm tốt để mua.')).toHaveLength(1);
  });

  it('leaves neutral explanations alone', () => {
    expect(findAdvice('Investors buy shares when they expect growth.')).toEqual(
      [],
    );
    expect(findAdvice('Giá tăng 1.5% trong tháng qua.')).toEqual([]);
    expect(findAdvice('The company sells phones and holds cash.')).toEqual([]);
  });
});

it('sanitize drops advice sentences and keeps decimals intact', () => {
  const {explanation: clean, removed} = sanitize(
    explanation({
      summary:
        'Revenue rose 2.5% last year. You should buy now. It makes phones.',
      positives: ['Strong brand', 'Worth buying at this price'],
    }),
  );
  expect(clean.summary).toBe('Revenue rose 2.5% last year. It makes phones.');
  expect(clean.positives).toEqual(['Strong brand']);
  expect(removed).toBe(2);
});

it('buildPrompt forbids advice and asks for the chosen language', () => {
  const {system, user} = buildPrompt({symbol: 'AAPL', price: 1}, 'vi');
  expect(system).toMatch(/Never tell the reader to buy, sell, hold/);
  expect(system).toMatch(/Vietnamese/);
  expect(user).toContain('"symbol": "AAPL"');
});

it('needs an API key', async () => {
  await expect(explainStock('AAPL', 'en')).rejects.toEqual(
    new AiError('NO_KEY'),
  );
});

it('explains with public data only and caches for the day', async () => {
  await saveApiKey('key-1');
  geminiReplies = [() => gemini(explanation())];
  const result = await explainStock('AAPL', 'vi');
  expect(result.model).toBe(GEMINI_MODELS[0]);
  expect(result.explanation.summary).toContain('Apple designs phones');

  const body = JSON.parse(geminiCalls[0].body);
  const prompt = body.contents[0].parts[0].text;
  expect(prompt).toContain('"symbol": "AAPL"');
  expect(prompt).toContain('Apple ships');
  expect(prompt).toContain('Apple thiết kế iPhone'); // built-in About text
  expect(body.generationConfig.responseMimeType).toBe('application/json');

  await explainStock('AAPL', 'vi');
  expect(geminiCalls).toHaveLength(1);
});

it('falls back to the next model when the free quota runs out', async () => {
  await saveApiKey('key-1');
  geminiReplies = [
    () => respond({error: {status: 'RESOURCE_EXHAUSTED'}}, 429),
    () => gemini(explanation()),
  ];
  const result = await explainStock('AAPL', 'en');
  expect(geminiCalls.map(c => c.model)).toEqual(GEMINI_MODELS);
  expect(result.model).toBe(GEMINI_MODELS[1]);
});

it('retries once when the answer gives advice, then strips what remains', async () => {
  await saveApiKey('key-1');
  geminiReplies = [
    () => gemini(explanation({summary: 'You should buy it.'})),
    () => gemini(explanation({risks: ['A strong buy for patient investors']})),
  ];
  const result = await explainStock('AAPL', 'en');
  expect(geminiCalls).toHaveLength(2);
  expect(geminiCalls[1].body).toContain('advice-like wording');
  expect(result.explanation.risks).toEqual([]);
  expect(result.removed).toBe(1);
});

it('reports an invalid key', async () => {
  await saveApiKey('bad');
  geminiReplies = [
    () =>
      respond(
        {
          error: {
            message: 'API key not valid',
            details: [{reason: 'API_KEY_INVALID'}],
          },
        },
        400,
      ),
  ];
  await expect(explainStock('AAPL', 'en')).rejects.toEqual(
    new AiError('INVALID_KEY'),
  );
});
