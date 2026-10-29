import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {container, vh, vw} from '../../services/styleSheet';
import {
  getPerformance,
  GrowthPeriod,
  Performance,
} from '../../services/marketData';
import {GrowthUniverse} from '../../services/renderData';
import {TKey, useI18n} from '../../services/i18n';
import {changeColor, formatMoney, formatPercent} from '../../services/format';
import ScreenHeader from '../../components/ScreenHeader';
import StockLogo from '../../components/StockLogo';
import Sparkline from '../../components/Sparkline';

type Direction = 'gainers' | 'losers';

const PERIODS: {key: GrowthPeriod; label: TKey; phrase: TKey}[] = [
  {key: 'day', label: 'movers.day', phrase: 'movers.periodDay'},
  {key: 'week', label: 'movers.week', phrase: 'movers.periodWeek'},
  {key: 'month', label: 'movers.month', phrase: 'movers.periodMonth'},
  {key: 'year', label: 'movers.year', phrase: 'movers.periodYear'},
];

const LIST_SIZE = 25;

const TopMovers = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {t} = useI18n();
  const [period, setPeriod] = useState<GrowthPeriod>('day');
  const [direction, setDirection] = useState<Direction>('gainers');
  const [items, setItems] = useState<Performance[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setFailed(false);
    getPerformance(GrowthUniverse, period)
      .then(result => !cancelled && setItems(result))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [period]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setItems(await getPerformance(GrowthUniverse, period, {fresh: true}));
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setRefreshing(false);
    }
  };

  const ranked = [...(items ?? [])]
    .sort((a, b) =>
      direction === 'gainers'
        ? b.changePercent - a.changePercent
        : a.changePercent - b.changePercent,
    )
    .slice(0, LIST_SIZE);
  const current = PERIODS.find(item => item.key === period)!;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('movers.title')} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFED4B"
            colors={['#FFED4B']}
          />
        }>
        <View style={styles.tabs}>
          {PERIODS.map(item => (
            <TouchableOpacity
              key={item.key}
              testID={`movers-period-${item.key}`}
              style={[styles.tab, period === item.key && styles.tabActive]}
              onPress={() => setPeriod(item.key)}>
              <Text
                style={[
                  styles.tabText,
                  period === item.key && styles.tabTextActive,
                ]}>
                {t(item.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.toggle}>
          {(['gainers', 'losers'] as Direction[]).map(item => (
            <TouchableOpacity
              key={item}
              testID={`movers-${item}`}
              style={[
                styles.toggleBtn,
                direction === item && styles.toggleBtnActive,
              ]}
              onPress={() => setDirection(item)}>
              <Text
                style={[
                  styles.toggleText,
                  direction === item && styles.toggleTextActive,
                ]}>
                {t(item === 'gainers' ? 'movers.gainers' : 'movers.losers')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.intro}>
          {t('movers.intro', {
            count: GrowthUniverse.length,
            period: t(current.phrase),
          })}
        </Text>

        {failed ? (
          <Text style={styles.message}>{t('common.dataError')}</Text>
        ) : !items ? (
          <ActivityIndicator color="#FFED4B" style={styles.loading} />
        ) : (
          ranked.map((item, index) => {
            const color = changeColor(item.changePercent);
            return (
              <TouchableOpacity
                key={item.symbol}
                testID={`mover-${index + 1}`}
                style={styles.row}
                onPress={() =>
                  navigation.navigate('ChartInfor', {symbol: item.symbol})
                }>
                <Text style={styles.rank}>{index + 1}</Text>
                <StockLogo symbol={item.symbol} size={36} />
                <View style={styles.names}>
                  <Text style={styles.symbol}>{item.symbol}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <Sparkline
                  data={item.spark}
                  width={vw(14)}
                  height={vw(8)}
                  color={color}
                />
                <View style={styles.priceColumn}>
                  <Text style={[styles.change, {color}]}>
                    {formatPercent(item.changePercent)}
                  </Text>
                  <Text style={styles.price}>
                    {formatMoney(item.price, {currency: item.currency})}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <Text style={styles.caveat}>{t('movers.caveat')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TopMovers;

const styles = StyleSheet.create({
  container: container,
  content: {
    paddingHorizontal: vw(5),
    paddingBottom: vh(4),
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2C',
    borderRadius: vw(2),
    padding: vw(1),
  },
  tab: {
    flex: 1,
    paddingVertical: vh(1.2),
    alignItems: 'center',
    borderRadius: vw(1.5),
  },
  tabActive: {
    backgroundColor: '#FFED4B',
  },
  tabText: {
    color: '#76787E',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1A1A1A',
  },
  toggle: {
    flexDirection: 'row',
    columnGap: vw(2),
    marginTop: vh(1.5),
  },
  toggleBtn: {
    paddingHorizontal: vw(4),
    paddingVertical: vh(0.8),
    borderRadius: vw(5),
    backgroundColor: '#2C2C2C',
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    color: '#76787E',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#1A1A1A',
  },
  intro: {
    color: '#76787E',
    fontSize: 13,
    marginVertical: vh(1.5),
  },
  loading: {
    marginTop: vh(4),
  },
  message: {
    color: '#76787E',
    textAlign: 'center',
    marginTop: vh(4),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: vw(2),
    paddingVertical: 10,
  },
  rank: {
    color: '#76787E',
    fontWeight: '600',
    width: vw(6),
    textAlign: 'center',
  },
  names: {
    flex: 1,
  },
  symbol: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  name: {
    color: '#76787E',
    fontSize: 12,
  },
  priceColumn: {
    alignItems: 'flex-end',
    minWidth: vw(19),
  },
  change: {
    fontWeight: '700',
    fontSize: 14,
  },
  price: {
    color: '#76787E',
    fontSize: 12,
  },
  caveat: {
    color: '#76787E',
    fontSize: 12,
    lineHeight: 17,
    marginTop: vh(2),
  },
});
