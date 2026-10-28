import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import StockLogo from './StockLogo';
import Sparkline from './Sparkline';
import type {Quote} from '../services/marketData';
import {
  changeColor,
  formatMoney,
  formatPercent,
  formatPoints,
} from '../services/format';
import {vw} from '../services/styleSheet';

export const formatQuotePrice = (quote: Quote) =>
  quote.type === 'INDEX'
    ? formatPoints(quote.price)
    : formatMoney(quote.price, {currency: quote.currency});

interface StockRowProps {
  symbol: string;
  name?: string;
  quote?: Quote;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  testID?: string;
}

// Logo, symbol and name on the left; sparkline; price and today's change on
// the right. Shared by the Home, Portfolio, Watchlist and Search lists.
const StockRow: React.FC<StockRowProps> = ({
  symbol,
  name,
  quote,
  subtitle,
  onPress,
  right,
  testID,
}) => {
  const color = changeColor(quote?.change ?? 0);
  return (
    <TouchableOpacity
      testID={testID}
      style={styles.row}
      disabled={!onPress}
      onPress={onPress}>
      <View style={styles.left}>
        <StockLogo symbol={symbol} />
        <View style={styles.names}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {subtitle ?? name ?? quote?.name ?? ''}
          </Text>
        </View>
      </View>
      {quote ? (
        <Sparkline
          data={quote.spark}
          width={vw(16)}
          height={vw(8)}
          color={color}
        />
      ) : null}
      <View style={styles.priceColumn}>
        <Text style={styles.price}>
          {quote ? formatQuotePrice(quote) : '—'}
        </Text>
        {quote ? (
          <Text style={[styles.change, {color}]}>
            {formatPercent(quote.changePercent)}
          </Text>
        ) : null}
      </View>
      {right}
    </TouchableOpacity>
  );
};

export default StockRow;

const styles = StyleSheet.create({
  row: {
    width: '100%',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: vw(2),
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: vw(2),
  },
  names: {
    flex: 1,
  },
  symbol: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    color: '#76787E',
    fontSize: 12,
  },
  priceColumn: {
    alignItems: 'flex-end',
    minWidth: vw(20),
  },
  price: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  change: {
    fontSize: 12,
  },
});
