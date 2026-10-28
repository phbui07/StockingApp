import type vi from './vi';

const en: Record<keyof typeof vi, string> = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.retry': 'Retry',
  'common.loading': 'Loading...',
  'common.processing': 'Processing...',
  'common.continue': 'Continue',
  'common.back': 'Back',
  'common.orContinueWith': 'Or continue with',
  'common.email': 'Email',
  'common.password': 'Password',
  'common.invalidEmail': 'Invalid email address',
  'common.passwordTooShort': 'Password must be at least 6 characters',
  'common.passwordMismatch': "Passwords don't match",
  'common.dataError': "Couldn't load market data. Pull down to retry.",
  'common.shares': '{count} shares',
  'common.marketOpen': 'Market open',
  'common.marketClosed': 'Market closed',
  'common.updatedAt': 'Updated at {time}',
  'common.today': 'today',

  // Chart ranges
  'range.1D': '1D',
  'range.1W': '1W',
  'range.1M': '1M',
  'range.3M': '3M',
  'range.6M': '6M',
  'range.1Y': '1Y',
  'range.5Y': '5Y',

  // Onboarding
  'onboarding.skip': 'Skip',
  'onboarding.slide1Title': 'Live stock charts',
  'onboarding.slide1Desc':
    'Follow live stock prices and make smarter investing decisions.',
  'onboarding.slide2Title': 'Grow your returns',
  'onboarding.slide2Desc':
    'Practice trading with $100,000 in virtual cash, risk-free.',
  'onboarding.login': 'Log in',
  'onboarding.signup': 'Sign up',

  // Login
  'login.title': 'Hello',
  'login.subtitle': 'Welcome back, please log in:',
  'login.forgot': 'Forgot password?',
  'login.noAccount': "Don't have an account?",
  'login.signUp': 'Sign up',
  'login.wrongCredentials': 'Incorrect email or password',
  'login.googleFailed': 'Google sign-in failed',
  'login.googleUnavailable': "Google sign-in isn't set up on this device.",

  // Sign up
  'signup.title': 'Join Stockline',
  'signup.subtitle': 'Start investing with $100,000 in virtual cash',
  'signup.name': 'Your name',
  'signup.nameRequired': 'Please enter your name',
  'signup.emailExists': 'This email is already registered',
  'signup.success': 'Account created',
  'signup.successMessage': 'You can now log in.',
  'signup.haveAccount': 'Already have an account?',
  'signup.login': 'Log in',

  // Welcome
  'welcome.hello': 'Hello {name}!',
  'welcome.title': 'Welcome to Stockline',
  'welcome.subtitle': 'You have {amount} in virtual cash to start practicing',
  'welcome.start': 'Get started',
  'welcome.friend': 'there',

  // Forgot / reset password
  'forgot.title': 'Forgot password',
  'forgot.desc':
    "Enter your registered email and we'll send a verification code to this device.",
  'forgot.send': 'Send code',
  'forgot.notFound': 'No account found with this email.',
  'forgot.googleAccount':
    'This account signs in with Google, so it has no password.',
  'reset.title': 'Set a new password',
  'reset.desc': 'Create a new password for {email}',
  'reset.newPassword': 'New password',
  'reset.confirmPassword': 'Confirm password',
  'reset.submit': 'Change password',
  'reset.success': 'Password changed. Please log in again.',

  // OTP
  'otp.title': 'Enter verification code',
  'otp.desc': "We've sent a 5-digit code as a notification on this device.",
  'otp.resend': 'Resend',
  'otp.verify': 'Verify',
  'otp.notificationTitle': 'Stockline verification code',
  'otp.notificationBody':
    'Your verification code is {code}. It expires in 5 minutes.',
  'otp.invalidTitle': 'Invalid code',
  'otp.invalid': 'Incorrect code, please try again',
  'otp.expired': 'This code has expired, please request a new one',
  'otp.fallbackTitle': 'Verification code',
  'otp.fallbackBody': 'Notifications are off, so here is your code: {code}',

  // Phone
  'phone.title': 'Enter your phone number',
  'phone.desc': "You'll get a 5-digit code to verify your phone number",
  'phone.send': 'Send code',
  'phone.invalidTitle': 'Invalid phone number',
  'phone.invalidDesc': 'Please check the number and try again',
  'phone.verified': 'Phone number verified',

  // Home
  'home.portfolioTotal': 'Total portfolio value',
  'home.watchlist': 'Watchlist',
  'home.watchlistEmpty': 'Tap + to add stocks to your watchlist',
  'home.popular': 'Popular stocks',

  // Portfolio (Chart tab)
  'portfolio.title': 'Portfolio',
  'portfolio.allTime': 'all time',
  'portfolio.gain': 'Gain',
  'portfolio.loss': 'Loss',
  'portfolio.noTrades':
    'Buy your first stock to see how your portfolio performs.',
  'portfolio.holdings': 'Holdings',
  'portfolio.cash': 'Cash',
  'portfolio.findStocks': 'Find stocks',

  // Trade tab
  'trade.title': 'Trade',
  'trade.buy': 'Buy',
  'trade.sell': 'Sell',
  'trade.overview': 'Overview',
  'trade.history': 'History',
  'trade.stats': 'Trading stats',
  'trade.totalTrades': 'Trades',
  'trade.winRate': 'Win rate',
  'trade.realizedPnL': 'Realized P&L',
  'trade.pnlChart': 'Realized P&L (7 days)',
  'trade.quickActions': 'Quick actions',
  'trade.cash': 'Cash',
  'trade.watchlist': 'Watchlist',
  'trade.watchlistCount': '{count} stocks',
  'trade.alerts': 'Price alerts',
  'trade.alertsCount': '{count} active',
  'trade.historyTitle': 'Trade history ({count})',
  'trade.noHistory': 'No trades yet',
  'trade.noHoldingsToSell': "You don't own any stocks to sell yet.",
  'trade.quantity': 'Quantity:',
  'trade.price': 'Price:',
  'trade.total': 'Total:',
  'trade.pnl': 'P&L:',
  'trade.completed': 'Completed',
  'trade.typeBuy': 'BUY',
  'trade.typeSell': 'SELL',

  // Holdings (Stock tab)
  'holdings.title': 'My holdings',
  'holdings.totalValue': 'Holdings value',
  'holdings.cashAvailable': 'Cash available: {amount}',
  'holdings.search': 'Search holdings...',
  'holdings.all': 'All',
  'holdings.gainers': 'Gainers',
  'holdings.losers': 'Losers',
  'holdings.count': 'Stocks owned ({count})',
  'holdings.avgCost': 'Avg cost {price}',
  'holdings.empty': "You don't own any stocks yet",
  'holdings.emptyDesc':
    'Find a stock and buy it with virtual cash to get started.',

  // Watchlist
  'watchlist.title': 'Watchlist',
  'watchlist.sort': 'Sort: {by}',
  'watchlist.sortDefault': 'Default',
  'watchlist.sortName': 'Name',
  'watchlist.sortChange': 'Change',
  'watchlist.sortPrice': 'Price',
  'watchlist.search': 'Search stocks...',
  'watchlist.count': 'Stocks',
  'watchlist.upDown': 'Up / Down',
  'watchlist.avgChange': 'Avg change',
  'watchlist.following': 'Watching ({count})',
  'watchlist.empty': 'Your watchlist is empty',
  'watchlist.emptyDesc': 'Search above to start watching stocks',
  'watchlist.results': 'Search results',

  // Search
  'search.titleView': 'Find stocks',
  'search.titleBuy': 'Choose a stock to buy',
  'search.titleSell': 'Choose a stock to sell',
  'search.titleAlert': 'Choose a stock for an alert',
  'search.placeholder': 'Symbol or company name...',
  'search.noResults': 'No results for "{query}"',
  'search.searching': 'Searching...',
  'search.failed': 'Search failed. Check your connection.',

  // Stock details
  'detail.title': 'Stock details',
  'detail.about': 'About',
  'detail.details': 'Details',
  'detail.news': 'News',
  'detail.website': 'WEBSITE:',
  'detail.employees': 'EMPLOYEES:',
  'detail.headquarters': 'HEADQUARTERS:',
  'detail.sector': 'SECTOR:',
  'detail.leader': 'LEADERSHIP:',
  'detail.exchange': 'EXCHANGE:',
  'detail.noProfile': 'No company profile for this symbol.',
  'detail.profileError': "Couldn't load the company profile.",
  'detail.keyStats': 'Key stats',
  'detail.open': 'Open',
  'detail.prevClose': 'Previous close',
  'detail.dayRange': 'Day range',
  'detail.yearRange': '52-week range',
  'detail.volume': 'Volume',
  'detail.avgVolume': 'Avg volume',
  'detail.marketCap': 'Market cap',
  'detail.pe': 'P/E',
  'detail.dividendYield': 'Dividend yield',
  'detail.financials': 'Financials',
  'detail.year': 'Year',
  'detail.revenue': 'Revenue',
  'detail.netIncome': 'Net income',
  'detail.noNews': 'No news yet',
  'detail.position': 'Your position',
  'detail.positionShares': 'Shares',
  'detail.positionAvg': 'Avg cost',
  'detail.positionValue': 'Market value',
  'detail.positionPnl': 'P&L',
  'detail.notTradable':
    "This symbol can't be traded in the app (only USD-listed stocks and ETFs are supported).",
  'detail.watch': 'Watch',
  'detail.unwatch': 'Unwatch',
  'detail.setAlert': 'Set price alert',
  'detail.chartError': "Couldn't load the chart",

  // Order
  'order.title': 'Confirm order',
  'order.marketPrice': 'Market price',
  'order.quantity': 'Quantity',
  'order.max': 'Max',
  'order.estimatedTotal': 'Estimated total',
  'order.cashAvailable': 'Cash available',
  'order.sharesOwned': 'Shares owned',
  'order.cashAfter': 'Cash after trade',
  'order.fundingSource': 'Funding source',
  'order.virtualAccount': 'Virtual account',
  'order.place': 'Place order',
  'order.disclaimer':
    'This is a simulated trade with virtual cash. Orders fill instantly at the latest price.',
  'order.insufficientCash': "You don't have enough cash for this order.",
  'order.insufficientShares': "You don't own enough shares to sell.",
  'order.invalidQuantity': 'Quantity must be greater than 0.',
  'order.priceUnavailable': 'Market price unavailable, please try again.',
  'order.confirmTitle': 'Confirm {side} order',
  'order.confirmMessage':
    '{side} {shares} shares of {symbol} at {price}?\nTotal: {total}',
  'order.successBuy': 'Bought {shares} shares of {symbol} at {price}.',
  'order.successSell': 'Sold {shares} shares of {symbol} at {price}.',
  'order.authPrompt': 'Authenticate to {side} {symbol}',
  'order.authFailed': 'Authentication failed. The order was not placed.',

  // Biometrics
  'bio.notAvailable': "This device doesn't support biometric authentication",
  'bio.failed': 'Authentication failed',
  'bio.error': 'Biometric authentication error',
  'bio.defaultReason': 'Authenticate to continue',

  // Price alerts
  'alerts.title': 'Price alerts',
  'alerts.add': 'Add alert',
  'alerts.currentPrice': 'Current price: {price}',
  'alerts.targetPlaceholder': 'Target price',
  'alerts.above': 'Notify when the price rises to {price}',
  'alerts.below': 'Notify when the price falls to {price}',
  'alerts.create': 'Create alert',
  'alerts.active': 'Active ({count})',
  'alerts.triggered': 'Triggered ({count})',
  'alerts.empty': 'No alerts yet',
  'alerts.emptyDesc':
    "Set a target price and get notified when it's reached (while the app is open).",
  'alerts.triggeredAt': 'Triggered {time}',
  'alerts.notifTitle': '{symbol} hit {price}',
  'alerts.notifBodyAbove': '{name} rose to {price} (target {target}).',
  'alerts.notifBodyBelow': '{name} fell to {price} (target {target}).',
  'alerts.invalidTarget':
    'Enter a valid target price that differs from the current price.',
  'alerts.permissionDenied':
    'Notifications are off. Turn them on in Settings to receive alerts.',
  'alerts.created': 'Alert created',
  'alerts.rearm': 'Re-enable',

  // Profile
  'profile.title': 'Account',
  'profile.virtualBalance': 'Virtual account',
  'profile.invite': 'Invite friends',
  'profile.inviteDesc': 'Share Stockline and practice investing together',
  'profile.inviteMessage':
    "I'm practicing stock investing with Stockline: virtual cash, real market prices. Try it with me!",
  'profile.account': 'Account',
  'profile.security': 'Security',
  'profile.transactions': 'Transactions',
  'profile.language': 'Language',
  'profile.settings': 'Settings',
  'profile.faq': 'FAQ',
  'profile.logout': 'Log out',
  'profile.logoutConfirm': 'Are you sure you want to log out?',

  // Account details
  'account.title': 'Account details',
  'account.name': 'Display name',
  'account.phone': 'Phone number',
  'account.addPhone': 'Add phone number',
  'account.changePhone': 'Change',
  'account.saveName': 'Save name',
  'account.nameSaved': 'Display name saved',
  'account.nameRequired': "Name can't be empty",
  'account.changePassword': 'Change password',
  'account.currentPassword': 'Current password',
  'account.wrongPassword': 'Current password is incorrect',
  'account.passwordChanged': 'Password changed',
  'account.googleAccount':
    "You sign in with Google, so there's no password to change.",

  // Security
  'security.title': 'Security',
  'security.biometricTrades': 'Require biometrics for trades',
  'security.biometricDesc':
    'Ask for {type} before placing a buy or sell order.',
  'security.notAvailable':
    'This device has no Face ID or fingerprint set up. Orders will be confirmed with a dialog instead.',
  'security.faceId': 'Face ID',
  'security.touchId': 'Touch ID',
  'security.fingerprint': 'your fingerprint',
  'security.enablePrompt': 'Authenticate to turn this on',

  // Language
  'language.title': 'Language',

  // Settings
  'settings.title': 'Settings',
  'settings.notifications': 'Notifications',
  'settings.notificationsDesc': 'Used for verification codes and price alerts.',
  'settings.notificationsOn': 'On',
  'settings.enableNotifications': 'Turn on',
  'settings.virtualAccount': 'Virtual account',
  'settings.startingBalance': 'Starting balance',
  'settings.reset': 'Reset virtual account',
  'settings.resetDesc':
    'Clears all holdings and trade history and resets your balance to {amount}.',
  'settings.resetConfirm':
    "Are you sure you want to reset? This can't be undone.",
  'settings.resetDone': 'Virtual account reset',
  'settings.dataSource': 'Data source',
  'settings.dataSourceDesc':
    'Prices come from Yahoo Finance, may be delayed by a few minutes, and refresh every 20 seconds while the app is open.',

  // FAQ
  'faq.title': 'FAQ',
  'faq.q1': 'Does Stockline use real money?',
  'faq.a1':
    'No. Every trade uses virtual cash. You start with $100,000 and can reset it anytime in Settings.',
  'faq.q2': 'Where do the prices come from?',
  'faq.a2':
    'Prices come from Yahoo Finance and refresh every 20 seconds while the app is open. They can lag the exchange by a few minutes.',
  'faq.q3': 'How are orders filled?',
  'faq.a3':
    'Buy and sell orders fill instantly at the latest price, even when the market is closed. There are no fees.',
  'faq.q4': 'How is profit and loss calculated?',
  'faq.a4':
    'Unrealized P&L = (current price − average cost) × shares. Realized P&L is recorded each time you sell.',
  'faq.q5': 'How do price alerts work?',
  'faq.a5':
    "Set a target price for a stock and you'll get a notification when it's reached. Alerts are only checked while the app is open.",
  'faq.q6': 'Where is my data stored?',
  'faq.a6':
    'Your account, portfolio and trade history are stored on this device only. Uninstalling the app deletes them.',
};

export default en;
