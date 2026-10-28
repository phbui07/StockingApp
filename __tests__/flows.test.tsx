/**
 * End-to-end flows through the real screens, against a fake Yahoo Finance.
 */
import React from 'react';
import {Alert, AlertButton} from 'react-native';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Notifications} from 'react-native-notifications';
import App from '../App';
import {refreshQuotes, resetQuoteStore} from '../services/quoteStore';
import {clearMarketDataCache} from '../services/marketData';

// Charts start Animated timers on mount that outlive the test file; the
// flows don't exercise charts, so render them as nothing.
jest.mock('react-native-gifted-charts', () => ({
  LineChart: () => null,
  BarChart: () => null,
}));
jest.mock('react-native-gifted-charts/dist/BarChart', () => ({
  BarChart: () => null,
}));

const DEMO = {email: 'a1@gmail.com', pass: '123456', name: 'Nguyễn Văn A'};
const prices: Record<string, number> = {};

const meta = (symbol: string) => ({
  symbol,
  currency: 'USD',
  instrumentType: symbol.startsWith('^') ? 'INDEX' : 'EQUITY',
  longName: `${symbol} Corp`,
  regularMarketPrice: prices[symbol] ?? 100,
  previousClose: 100,
  regularMarketTime: Date.now() / 1000,
  currentTradingPeriod: {regular: {start: 0, end: 0}},
});

const respond = (body: unknown, status = 200) =>
  Promise.resolve({
    ok: status < 400,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(String(body)),
  } as Response);

const fakeYahoo = (url: string) => {
  if (url.includes('/v7/finance/spark')) {
    const symbols = decodeURIComponent(
      url.split('symbols=')[1].split('&')[0],
    ).split(',');
    return respond({
      spark: {
        result: symbols.map(symbol => ({
          symbol,
          response: [
            {meta: meta(symbol), indicators: {quote: [{close: [100, 101]}]}},
          ],
        })),
      },
    });
  }
  if (url.includes('/v8/finance/chart/')) {
    const symbol = decodeURIComponent(url.split('/chart/')[1].split('?')[0]);
    const now = Math.floor(Date.now() / 1000);
    return respond({
      chart: {
        result: [
          {
            meta: meta(symbol),
            timestamp: [now - 120, now - 60],
            indicators: {quote: [{close: [99, 100]}]},
          },
        ],
      },
    });
  }
  if (url.includes('/v1/finance/search')) {
    return respond(
      url.includes('newsCount=0')
        ? {
            quotes: [
              {
                symbol: 'TSLA',
                longname: 'Tesla, Inc.',
                exchDisp: 'NASDAQ',
                quoteType: 'EQUITY',
              },
            ],
          }
        : {news: []},
    );
  }
  if (url.includes('getcrumb')) {
    return respond('crumb');
  }
  if (url.includes('quoteSummary')) {
    return respond({
      quoteSummary: {
        result: [{assetProfile: {longBusinessSummary: 'Makes things.'}}],
      },
    });
  }
  return respond('', 404);
};

// Records Alert.alert calls so tests can tap their buttons.
const alertSpy = jest.spyOn(Alert, 'alert');
const pressAlert = async (buttonText: string) => {
  const call = alertSpy.mock.calls[alertSpy.mock.calls.length - 1];
  const buttons = (call?.[2] ?? []) as AlertButton[];
  const button = buttons.find(b => b.text === buttonText);
  if (!button) {
    throw new Error(
      `No "${buttonText}" button in alert ${JSON.stringify(call?.slice(0, 2))}`,
    );
  }
  await act(async () => {
    await button.onPress?.();
  });
};

const savedUserData = async () =>
  JSON.parse((await AsyncStorage.getItem(`stockline.user.${DEMO.email}`))!);

const startLoggedIn = async () => {
  await AsyncStorage.setItem(
    'userLoginStorage',
    JSON.stringify({
      email: DEMO.email,
      name: DEMO.name,
      givenName: DEMO.name,
      familyName: null,
      photoUrl: null,
    }),
  );
  await render(<App />);
  await screen.findByTestId('home-total');
};

const openStock = async (symbol: string) => {
  await fireEvent.press(await screen.findByTestId(`popular-${symbol}`));
  await screen.findByTestId('detail-buy');
  await waitFor(() =>
    expect(screen.getByTestId('detail-price')).toHaveTextContent(/\$/),
  );
};

const placeOrder = async (quantity: string, confirmLabel = 'Đặt lệnh') => {
  await fireEvent.changeText(
    await screen.findByTestId('order-quantity'),
    quantity,
  );
  await fireEvent.press(screen.getByTestId('order-place'));
  await pressAlert(confirmLabel); // confirmation dialog
  await pressAlert('OK'); // success dialog
};

beforeEach(async () => {
  await AsyncStorage.clear();
  resetQuoteStore();
  clearMarketDataCache();
  Object.keys(prices).forEach(key => delete prices[key]);
  alertSpy.mockClear();
  (Notifications.postLocalNotification as jest.Mock).mockClear();
  globalThis.fetch = jest.fn(fakeYahoo) as any;
});

it('signs up, logs in, shows the welcome screen and a $100,000 portfolio', async () => {
  await render(<App />);
  // Onboarding shows a 3-second splash first.
  await fireEvent.press(
    await screen.findByTestId('onboarding-signup', {}, {timeout: 5000}),
  );
  await fireEvent.changeText(screen.getByTestId('signup-name'), 'Lan');
  await fireEvent.changeText(
    screen.getByTestId('signup-email'),
    'Lan@Example.com',
  );
  await fireEvent.changeText(screen.getByTestId('signup-password'), '123');
  await fireEvent.press(screen.getByTestId('signup-submit'));
  expect(screen.getByText('Mật khẩu tối thiểu 6 ký tự')).toBeOnTheScreen();

  await fireEvent.changeText(screen.getByTestId('signup-password'), 'secret1');
  await fireEvent.press(screen.getByTestId('signup-submit'));
  await pressAlert('OK');

  await fireEvent.changeText(
    await screen.findByTestId('login-email'),
    'lan@example.com',
  );
  await fireEvent.changeText(screen.getByTestId('login-password'), 'wrong');
  await fireEvent.press(screen.getByTestId('login-submit'));
  expect(alertSpy).toHaveBeenLastCalledWith('Email hoặc mật khẩu không đúng');

  await fireEvent.changeText(screen.getByTestId('login-password'), 'secret1');
  await fireEvent.press(screen.getByTestId('login-submit'));
  expect(await screen.findByText(/Xin chào Lan!/)).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('welcome-start'));

  await fireEvent.press(await screen.findByTestId('home-toggle-total'));
  expect(screen.getByTestId('home-total')).toHaveTextContent('$100,000.00');
}, 15000);

it('buys and sells with virtual cash and records realized P&L', async () => {
  prices.AAPL = 200;
  await startLoggedIn();
  await openStock('AAPL');

  await fireEvent.press(screen.getByTestId('detail-buy'));
  await placeOrder('3');
  await screen.findByTestId('detail-position');

  let saved = await savedUserData();
  expect(saved.portfolio.cash).toBe(100000 - 600);
  expect(saved.portfolio.positions.AAPL).toMatchObject({
    shares: 3,
    avgCost: 200,
  });

  prices.AAPL = 250;
  await act(() => refreshQuotes(['AAPL']));
  await fireEvent.press(screen.getByTestId('detail-sell'));
  await placeOrder('2');

  saved = await savedUserData();
  expect(saved.portfolio.positions.AAPL.shares).toBe(1);
  expect(saved.portfolio.cash).toBe(99400 + 500);
  expect(saved.portfolio.transactions[0]).toMatchObject({
    side: 'SELL',
    realizedPnL: 100,
  });

  // The Trade tab reflects the history.
  await fireEvent.press(screen.getByLabelText('Quay lại'));
  await fireEvent.press(await screen.findByTestId('tab-Trade'));
  await waitFor(() =>
    expect(screen.getByTestId('trade-total-trades')).toHaveTextContent('2'),
  );
});

it('blocks orders the account cannot afford', async () => {
  prices.AAPL = 200;
  await startLoggedIn();
  await openStock('AAPL');
  await fireEvent.press(screen.getByTestId('detail-buy'));
  await fireEvent.changeText(
    await screen.findByTestId('order-quantity'),
    '1000',
  );
  expect(screen.getByText('Không đủ tiền mặt cho lệnh này.')).toBeOnTheScreen();
  expect(screen.getByTestId('order-place')).toBeDisabled();

  await fireEvent.press(screen.getByTestId('order-max'));
  expect(screen.getByTestId('order-quantity')).toHaveDisplayValue('500');
});

it('adds and removes stocks from the watchlist', async () => {
  await startLoggedIn();
  await fireEvent.press(screen.getByTestId('home-watchlist-add'));
  await fireEvent.changeText(
    await screen.findByTestId('watchlist-search'),
    'tesla',
  );
  // TSLA is in the default watchlist, so remove it from the search results.
  await fireEvent.press(
    await screen.findByTestId('search-toggle-TSLA', {}, {timeout: 2000}),
  );
  await waitFor(async () =>
    expect((await savedUserData()).watchlist).not.toContain('TSLA'),
  );
  expect(screen.queryByTestId('watchlist-row-TSLA')).toBeNull();
  await fireEvent.press(screen.getByTestId('search-toggle-TSLA'));
  await waitFor(async () =>
    expect((await savedUserData()).watchlist).toContain('TSLA'),
  );
  expect(screen.getByTestId('watchlist-row-TSLA')).toBeOnTheScreen();
});

it('fires a price alert notification when the target is crossed', async () => {
  prices.AAPL = 200;
  await startLoggedIn();
  await openStock('AAPL');
  await fireEvent.press(screen.getByTestId('detail-alert'));
  await fireEvent.changeText(await screen.findByTestId('alert-target'), '210');
  expect(screen.getByText('Báo khi giá tăng lên $210.00')).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('alert-create'));
  await waitFor(() =>
    expect(alertSpy).toHaveBeenLastCalledWith('Đã tạo cảnh báo', undefined),
  );

  prices.AAPL = 205;
  await act(() => refreshQuotes());
  expect(Notifications.postLocalNotification).not.toHaveBeenCalled();

  prices.AAPL = 212;
  await act(() => refreshQuotes());
  expect(Notifications.postLocalNotification).toHaveBeenCalledWith(
    expect.objectContaining({title: 'AAPL đã chạm $212.00'}),
    expect.any(Number),
  );
  expect(await screen.findByText('Đã kích hoạt (1)')).toBeOnTheScreen();
});

it('resets a forgotten password with a code sent as a notification', async () => {
  await render(<App />);
  await fireEvent.press(
    await screen.findByTestId('onboarding-login', {}, {timeout: 5000}),
  );
  await fireEvent.press(screen.getByTestId('login-forgot'));
  await fireEvent.changeText(
    screen.getByTestId('forgot-email'),
    'nobody@example.com',
  );
  await fireEvent.press(screen.getByTestId('forgot-submit'));
  expect(alertSpy).toHaveBeenLastCalledWith(
    'Lỗi',
    'Không tìm thấy tài khoản với email này.',
  );

  await fireEvent.changeText(screen.getByTestId('forgot-email'), DEMO.email);
  await fireEvent.press(screen.getByTestId('forgot-submit'));
  await waitFor(() =>
    expect(Notifications.postLocalNotification).toHaveBeenCalled(),
  );
  const body: string = (Notifications.postLocalNotification as jest.Mock).mock
    .calls[0][0].body;
  const code = body.match(/\d{5}/)![0];

  for (let i = 0; i < 5; i++) {
    await fireEvent.changeText(screen.getByTestId(`otp_input_${i}`), code[i]);
  }
  await fireEvent.press(screen.getByTestId('otp-verify'));
  await fireEvent.changeText(
    await screen.findByTestId('reset-password'),
    'newpass1',
  );
  await fireEvent.changeText(screen.getByTestId('reset-confirm'), 'newpass1');
  await fireEvent.press(screen.getByTestId('forgot-submit'));
  await pressAlert('OK');

  await fireEvent.changeText(
    await screen.findByTestId('login-email'),
    DEMO.email,
  );
  await fireEvent.changeText(screen.getByTestId('login-password'), 'newpass1');
  await fireEvent.press(screen.getByTestId('login-submit'));
  expect(await screen.findByTestId('welcome-start')).toBeOnTheScreen();
}, 15000);

it('switches the language and logs out', async () => {
  await startLoggedIn();
  await fireEvent.press(screen.getByTestId('tab-Profile'));
  await fireEvent.press(await screen.findByTestId('profile-Language'));
  await fireEvent.press(await screen.findByTestId('language-en'));
  expect(await screen.findByText('Language')).toBeOnTheScreen();
  expect(await AsyncStorage.getItem('stockline.language')).toBe('"en"');

  await fireEvent.press(screen.getByLabelText('Back'));
  await fireEvent.press(await screen.findByTestId('profile-logout'));
  await pressAlert('Log out');
  expect(await screen.findByTestId('login-submit')).toBeOnTheScreen();
  expect(await AsyncStorage.getItem('userLoginStorage')).toBeNull();
});
