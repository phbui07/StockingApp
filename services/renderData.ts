import type React from 'react';
import {
  accountIcon,
  billIcon,
  languageIcon,
  questionIcon,
  securityIcon,
  settingIcon,
} from '../assets/svgXML';
import {vw} from './styleSheet';
import type {TKey} from './i18n';
import type {AccountInterface} from './typeProps';

export const InitPageData: {img: any; title: TKey; description: TKey}[] = [
  {
    img: require('../assets/init/phone1.png'),
    title: 'onboarding.slide1Title',
    description: 'onboarding.slide1Desc',
  },
  {
    img: require('../assets/init/phone2.png'),
    title: 'onboarding.slide2Title',
    description: 'onboarding.slide2Desc',
  },
];

// Market indices shown on Home, with a short label for the card.
export const MarketIndices = [
  {symbol: '^GSPC', label: 'S&P 500'},
  {symbol: '^IXIC', label: 'NASDAQ'},
  {symbol: '^DJI', label: 'DJIA'},
  {symbol: '^FTSE', label: 'FTSE 100'},
  {symbol: '^N225', label: 'Nikkei 225'},
  {symbol: '000001.SS', label: 'Shanghai'},
];

export const PopularStocks = [
  'AAPL',
  'MSFT',
  'NVDA',
  'AMZN',
  'GOOGL',
  'META',
  'TSLA',
  'NFLX',
];

// Large, well-known US companies across sectors, ranked by the growth
// screen. Sticking to big names keeps tiny, erratic stocks out of the list.
// prettier-ignore
export const GrowthUniverse = [
  // Technology & communication
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AVGO', 'ORCL',
  'CRM', 'ADBE', 'AMD', 'INTC', 'CSCO', 'IBM', 'QCOM', 'TXN', 'AMAT', 'MU',
  'NOW', 'INTU', 'PLTR', 'UBER', 'PANW', 'CRWD', 'ANET', 'NFLX', 'SHOP',
  'SPOT', 'TSM', 'ARM', 'SNOW',
  // Financials
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'V', 'MA', 'AXP', 'BLK', 'SCHW',
  'PYPL', 'BRK-B', 'COIN',
  // Health care
  'LLY', 'UNH', 'JNJ', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'AMGN', 'GILD',
  'ISRG', 'CVS', 'BMY',
  // Consumer
  'WMT', 'COST', 'HD', 'MCD', 'NKE', 'SBUX', 'KO', 'PEP', 'PG', 'DIS', 'LOW',
  'TGT', 'BKNG', 'ABNB', 'CMG', 'PM', 'F', 'GM', 'MAR',
  // Industrials, energy, utilities & materials
  'BA', 'CAT', 'GE', 'HON', 'UPS', 'DE', 'LMT', 'RTX', 'UNP', 'MMM', 'DAL',
  'XOM', 'CVX', 'COP', 'NEE', 'LIN',
  // Telecom & media
  'T', 'VZ', 'TMUS', 'CMCSA',
];

export const ProfileRenderView: {
  label: TKey;
  icon: React.ReactNode;
  route: string;
}[] = [
  {label: 'profile.account', icon: accountIcon(vw(8), vw(8)), route: 'Account'},
  {
    label: 'profile.security',
    icon: securityIcon(vw(8), vw(8)),
    route: 'Security',
  },
  {
    label: 'profile.transactions',
    icon: billIcon(vw(8), vw(8)),
    route: 'Transactions',
  },
  {
    label: 'profile.language',
    icon: languageIcon(vw(8), vw(8)),
    route: 'Language',
  },
  {
    label: 'profile.settings',
    icon: settingIcon(vw(8), vw(8)),
    route: 'Settings',
  },
  {label: 'profile.faq', icon: questionIcon(vw(8), vw(8)), route: 'FAQ'},
];

// Seeded on first launch so there's an account to try right away.
export const Accounts: AccountInterface[] = [
  {
    name: 'Nguyễn Văn A',
    email: 'a1@gmail.com',
    pass: '123456',
    provider: 'password',
  },
];
