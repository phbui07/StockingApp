import {readJSON, removeKey, writeJSON} from './storage';
import type {Lang} from './i18n';
import {
  ChartPoint,
  getChart,
  getCompanyInfo,
  getNews,
  getQuotes,
} from './marketData';
import type {IndicatorId, TrackRecord} from './indicators';
import {COMPANY_ABOUT} from '../locales/companies';

// AI explanations of a stock, from Google's Gemini API (free tier).
//
// This is education, not investment advice: the prompt forbids
// recommendations and findAdvice() strips any that slip through. Only public
// market data is sent, never the user's account or portfolio, because Google
// may use free-tier content to improve its products.

// Tried in order: when the first model's free quota runs out, use the next.
export const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];
export const GEMINI_KEY_URL = 'https://aistudio.google.com/apikey';
const API = 'https://generativelanguage.googleapis.com/v1beta';
const KEY_STORAGE = 'stockline.geminiKey';

export type AiErrorCode =
  | 'NO_KEY'
  | 'INVALID_KEY'
  | 'QUOTA'
  | 'BLOCKED'
  | 'NETWORK'
  | 'BAD_RESPONSE';

export class AiError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode) {
    super(code);
    this.code = code;
  }
}

export interface Explanation {
  summary: string;
  priceAction: string;
  valuation: string;
  news: string;
  positives: string[];
  risks: string[];
  questions: string[];
  terms: {term: string; meaning: string}[];
}

export interface ExplanationResult {
  explanation: Explanation;
  model: string;
  generatedAt: number;
  removed: number; // advice-like sentences filtered out
}

export const getApiKey = () => readJSON<string | null>(KEY_STORAGE, null);
export const saveApiKey = (key: string) => writeJSON(KEY_STORAGE, key.trim());
export const removeApiKey = () => removeKey(KEY_STORAGE);

// Lists models, which checks the key without using generation quota.
export const verifyApiKey = async (key: string) => {
  let res: Response;
  try {
    res = await fetch(`${API}/models?pageSize=1`, {
      headers: {'x-goog-api-key': key.trim()},
    });
  } catch {
    throw new AiError('NETWORK');
  }
  if ([400, 401, 403].includes(res.status)) {
    throw new AiError('INVALID_KEY');
  }
  if (!res.ok) {
    throw new AiError('NETWORK');
  }
};

// ---- Advice filter -------------------------------------------------------

const ADVICE_PATTERNS: RegExp[] = [
  /\byou should\b/i,
  /\b(?:we|i) (?:would )?recommend\b/i,
  /\brecommend(?:s|ed)? (?:buying|selling|holding)\b/i,
  /\b(?:buy|sell|hold) (?:rating|recommendation|signal)\b/i,
  /\bstrong (?:buy|sell)\b/i,
  /\bprice target\b|\btarget price\b/i,
  /\b(?:good|great|right|ideal|bad) time to (?:buy|sell)\b/i,
  /\bworth (?:buying|selling)\b/i,
  /\b(?:consider|start) (?:buying|selling)\b/i,
  /\bbuy the dip\b/i,
  /\b(?:accumulate|overweight|underweight)\b/i,
  /\ballocat(?:e|ing) \d/i,
  /nên (?:mua|bán|nắm giữ|giữ lại|tích lũy|chốt lời|cắt lỗ)/i,
  /bạn nên/i,
  /khuyến nghị (?:mua|bán|nắm giữ)/i,
  /giá mục tiêu/i,
  /thời điểm (?:tốt|thích hợp|phù hợp|lý tưởng) để (?:mua|bán)/i,
  /đáng (?:mua|bán)/i,
  /tích lũy cổ phiếu/i,
];

export const findAdvice = (text: string) =>
  ADVICE_PATTERNS.map(pattern => text.match(pattern)?.[0]).filter(
    (match): match is string => !!match,
  );

const allText = (e: Explanation) =>
  [
    e.summary,
    e.priceAction,
    e.valuation,
    e.news,
    ...e.positives,
    ...e.risks,
    ...e.questions,
    ...e.terms.flatMap(term => [term.term, term.meaning]),
  ].join('\n');

// Splits on sentence-ending punctuation followed by a space, so decimals
// like "1.5%" stay intact.
const sentences = (text: string) =>
  text.replace(/([.!?])\s+/g, '$1\u0000').split('\u0000');

export const sanitize = (e: Explanation) => {
  let removed = 0;
  const cleanText = (text: string) => {
    const parts = sentences(text);
    const kept = parts.filter(part => !findAdvice(part).length);
    removed += parts.length - kept.length;
    return kept.join(' ').trim();
  };
  const cleanList = (items: string[]) => {
    const kept = items.filter(item => !findAdvice(item).length);
    removed += items.length - kept.length;
    return kept;
  };
  const terms = e.terms.filter(
    term => !findAdvice(`${term.term} ${term.meaning}`).length,
  );
  removed += e.terms.length - terms.length;
  return {
    explanation: {
      summary: cleanText(e.summary),
      priceAction: cleanText(e.priceAction),
      valuation: cleanText(e.valuation),
      news: cleanText(e.news),
      positives: cleanList(e.positives),
      risks: cleanList(e.risks),
      questions: cleanList(e.questions),
      terms,
    },
    removed,
  };
};

// ---- Prompt --------------------------------------------------------------

const INDICATOR_NAMES: Record<IndicatorId, string> = {
  aboveSma200: 'Price is above its 200-day moving average',
  smaCross: '50-day moving average is above the 200-day moving average',
  rsiBelow30: 'RSI(14) is below 30',
  rsiAbove70: 'RSI(14) is above 70',
  drawdown10: 'Price is more than 10% below its 52-week high',
};

const round = (value?: number) =>
  value === undefined || !Number.isFinite(value)
    ? undefined
    : Math.round(value * 100) / 100;

const changeOver = (points: ChartPoint[], tradingDays?: number) => {
  if (points.length < 2) {
    return undefined;
  }
  const last = points[points.length - 1].value;
  const start =
    tradingDays === undefined
      ? 0
      : Math.max(0, points.length - 1 - tradingDays);
  return round((last / points[start].value - 1) * 100);
};

export type ExplainerData = Record<string, unknown>;

// Everything the model may use. Public market data only.
export const gatherData = async (
  symbol: string,
  lang: Lang,
  trackRecord?: TrackRecord | null,
): Promise<ExplainerData> => {
  const [quotes, stockYear, marketYear, news, info] = await Promise.all([
    getQuotes([symbol, '^GSPC']),
    getChart(symbol, '1Y'),
    getChart('^GSPC', '1Y').catch(() => null),
    getNews(symbol).catch(() => []),
    getCompanyInfo(symbol).catch(() => null),
  ]);
  const quote = quotes[symbol];
  if (!quote) {
    throw new AiError('NETWORK');
  }
  const market = marketYear?.points ?? [];
  const periods: [string, number | undefined][] = [
    ['1 month', 21],
    ['6 months', 126],
    ['1 year', undefined],
  ];
  return {
    symbol,
    name: quote.name,
    type: quote.type,
    currency: quote.currency,
    exchange: quote.exchange,
    description: COMPANY_ABOUT[symbol]?.description[lang],
    price: round(quote.price),
    changeTodayPercent: round(quote.changePercent),
    fiftyTwoWeekLow: round(quote.fiftyTwoWeekLow),
    fiftyTwoWeekHigh: round(quote.fiftyTwoWeekHigh),
    volume: quote.volume,
    averageVolume: info?.averageVolume,
    marketCap: info?.marketCap,
    trailingPE: round(info?.peRatio),
    dividendYieldPercent:
      info?.dividendYield !== undefined
        ? round(info.dividendYield * 100)
        : undefined,
    sector: info?.sector,
    performancePercent: periods.map(([period, days]) => ({
      period,
      stock: changeOver(stockYear.points, days),
      sp500: changeOver(market, days),
    })),
    indicatorsToday: (trackRecord?.records ?? [])
      .filter(record => record.activeNow !== undefined)
      .map(record => ({
        indicator: INDICATOR_NAMES[record.id],
        holdsToday: record.activeNow,
      })),
    recentHeadlines: news.slice(0, 6).map(item => ({
      title: item.title,
      publisher: item.publisher,
      date: new Date(item.publishedAt).toISOString().slice(0, 10),
    })),
  };
};

export const buildPrompt = (data: ExplainerData, lang: Lang) => {
  const language = lang === 'vi' ? 'Vietnamese' : 'English';
  const system = [
    'You are a patient teacher helping a beginner learn how the stock market works.',
    'You explain one stock or market index using ONLY the data the user provides.',
    '',
    'Rules:',
    '- This is education, not investment advice. Never tell the reader to buy, sell, hold, accumulate or avoid any security.',
    '- Never give ratings, price targets, forecasts of future prices, or portfolio allocations, and never say what the reader "should" do with money.',
    "- Present supporters' and critics' views fairly and neutrally.",
    "- Use only numbers that appear in the data. If something isn't in the data, say it isn't available instead of guessing.",
    '- Explain financial terms in simple words.',
    `- Write every value in ${language}. Keep paragraphs to 2–4 sentences and list items to one sentence.`,
  ].join('\n');
  const user = [
    `Today's date: ${new Date().toISOString().slice(0, 10)}.`,
    'Explain this security for a beginner, following the response schema.',
    'Data (JSON):',
    JSON.stringify(data, null, 1),
  ].join('\n');
  return {system, user};
};

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: {
      type: 'STRING',
      description: 'What this company or index is and what stands out now.',
    },
    priceAction: {
      type: 'STRING',
      description:
        'How the price moved over 1 month, 6 months and 1 year, compared with the S&P 500.',
    },
    valuation: {
      type: 'STRING',
      description:
        'What the available numbers (P/E, market cap, dividend yield, 52-week range) mean in plain words.',
    },
    news: {
      type: 'STRING',
      description: 'What the recent headlines are about, without speculating.',
    },
    positives: {
      type: 'ARRAY',
      items: {type: 'STRING'},
      description: '2-4 factors supporters point to.',
    },
    risks: {
      type: 'ARRAY',
      items: {type: 'STRING'},
      description: '2-4 risks or concerns critics point to.',
    },
    questions: {
      type: 'ARRAY',
      items: {type: 'STRING'},
      description: '3 questions a beginner could research to learn more.',
    },
    terms: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {term: {type: 'STRING'}, meaning: {type: 'STRING'}},
        required: ['term', 'meaning'],
      },
      description: '2-3 financial terms used above, explained simply.',
    },
  },
  required: [
    'summary',
    'priceAction',
    'valuation',
    'news',
    'positives',
    'risks',
    'questions',
    'terms',
  ],
};

// ---- Gemini call ---------------------------------------------------------

const strings = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

const normalize = (raw: any): Explanation => ({
  summary: String(raw?.summary ?? ''),
  priceAction: String(raw?.priceAction ?? ''),
  valuation: String(raw?.valuation ?? ''),
  news: String(raw?.news ?? ''),
  positives: strings(raw?.positives).slice(0, 5),
  risks: strings(raw?.risks).slice(0, 5),
  questions: strings(raw?.questions).slice(0, 4),
  terms: (Array.isArray(raw?.terms) ? raw.terms : [])
    .filter((term: any) => term?.term && term?.meaning)
    .slice(0, 4)
    .map((term: any) => ({
      term: String(term.term),
      meaning: String(term.meaning),
    })),
});

const generate = async (key: string, system: string, user: string) => {
  let lastError = new AiError('NETWORK');
  for (const model of GEMINI_MODELS) {
    let res: Response;
    try {
      res = await fetch(`${API}/models/${model}:generateContent`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'x-goog-api-key': key},
        body: JSON.stringify({
          systemInstruction: {parts: [{text: system}]},
          contents: [{role: 'user', parts: [{text: user}]}],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      });
    } catch {
      lastError = new AiError('NETWORK');
      continue;
    }
    if (res.status === 401 || res.status === 403) {
      throw new AiError('INVALID_KEY');
    }
    if (res.status === 400) {
      const body = await res.text().catch(() => '');
      if (body.includes('API_KEY_INVALID') || body.includes('API key')) {
        throw new AiError('INVALID_KEY');
      }
      lastError = new AiError('BAD_RESPONSE');
      continue;
    }
    if (res.status === 429) {
      lastError = new AiError('QUOTA');
      continue;
    }
    if (!res.ok) {
      // Overloaded (503) or a model this key can't use (404): try the next.
      lastError = new AiError(res.status === 404 ? 'BAD_RESPONSE' : 'NETWORK');
      continue;
    }
    const data = await res.json();
    if (data?.promptFeedback?.blockReason) {
      throw new AiError('BLOCKED');
    }
    const candidate = data?.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
      throw new AiError('BLOCKED');
    }
    const text = (candidate?.content?.parts ?? [])
      .filter((part: any) => !part.thought && typeof part.text === 'string')
      .map((part: any) => part.text)
      .join('');
    try {
      return {explanation: normalize(JSON.parse(text)), model};
    } catch {
      lastError = new AiError('BAD_RESPONSE');
    }
  }
  throw lastError;
};

const cacheKey = (symbol: string, lang: Lang) =>
  `stockline.ai.${symbol}.${lang}`;
const sameDay = (a: number, b: number) =>
  new Date(a).toDateString() === new Date(b).toDateString();

// Explanations are cached per stock and language for the day, which keeps
// usage well inside the free quota.
export const getCachedExplanation = async (symbol: string, lang: Lang) => {
  const hit = await readJSON<ExplanationResult | null>(
    cacheKey(symbol, lang),
    null,
  );
  return hit && sameDay(hit.generatedAt, Date.now()) ? hit : null;
};

export const explainStock = async (
  symbol: string,
  lang: Lang,
  {
    trackRecord,
    force = false,
  }: {trackRecord?: TrackRecord | null; force?: boolean} = {},
): Promise<ExplanationResult> => {
  if (!force) {
    const hit = await getCachedExplanation(symbol, lang);
    if (hit) {
      return hit;
    }
  }
  const key = await getApiKey();
  if (!key) {
    throw new AiError('NO_KEY');
  }
  const data = await gatherData(symbol, lang, trackRecord);
  const {system, user} = buildPrompt(data, lang);
  let {explanation, model} = await generate(key, system, user);

  // One retry if the model slipped into advice, then strip what remains.
  const advice = findAdvice(allText(explanation));
  if (advice.length) {
    ({explanation, model} = await generate(
      key,
      system,
      `${user}\n\nYour previous answer used advice-like wording (${advice
        .map(a => `"${a}"`)
        .join(', ')}). Explain without any recommendation.`,
    ));
  }
  const clean = sanitize(explanation);
  const result: ExplanationResult = {
    explanation: clean.explanation,
    model,
    generatedAt: Date.now(),
    removed: clean.removed,
  };
  await writeJSON(cacheKey(symbol, lang), result);
  return result;
};
