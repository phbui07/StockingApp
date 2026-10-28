/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import {addIcon, viewIcon} from '../../assets/svgXML';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuotes} from '../../services/quoteStore';
import {useUserData} from '../../services/userData';
import {useSymbolSearch} from '../../services/useSymbolSearch';
import {TKey, useI18n} from '../../services/i18n';
import {changeColor, formatPercent} from '../../services/format';
import type {Quote} from '../../services/marketData';
import ScreenHeader from '../../components/ScreenHeader';
import StockRow from '../../components/StockRow';

type SortKey = 'default' | 'name' | 'change' | 'price';
const SORTS: {key: SortKey; label: TKey}[] = [
  {key: 'default', label: 'watchlist.sortDefault'},
  {key: 'name', label: 'watchlist.sortName'},
  {key: 'change', label: 'watchlist.sortChange'},
  {key: 'price', label: 'watchlist.sortPrice'},
];

const Watchlist = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {t} = useI18n();
  const {data, toggleWatch, isWatched} = useUserData();
  const [searchText, setSearchText] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const search = useSymbolSearch(searchText);
  const {quotes, refresh} = useQuotes([
    ...data.watchlist,
    ...search.results.map(result => result.symbol),
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const sort = SORTS[sortIndex];
  const watched = sortSymbols(data.watchlist, quotes, sort.key);
  const watchedQuotes = data.watchlist
    .map(symbol => quotes[symbol])
    .filter((quote): quote is Quote => !!quote);
  const up = watchedQuotes.filter(quote => quote.change > 0).length;
  const avgChange = watchedQuotes.length
    ? watchedQuotes.reduce((total, quote) => total + quote.changePercent, 0) /
      watchedQuotes.length
    : 0;

  const toggleButton = (symbol: string, testPrefix: string) => {
    const watching = isWatched(symbol);
    return (
      <TouchableOpacity
        testID={`${testPrefix}-${symbol}`}
        accessibilityRole="button"
        accessibilityLabel={t(watching ? 'detail.unwatch' : 'detail.watch')}
        style={styles.watchlistButton}
        onPress={() => toggleWatch(symbol)}>
        <View
          style={[
            styles.heartContainer,
            {backgroundColor: watching ? '#FFED4B' : 'transparent'},
          ]}>
          {addIcon(vw(5), vw(5), watching ? '#1A1A1A' : '#76787E')}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('watchlist.title')} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFED4B"
            colors={['#FFED4B']}
          />
        }>
        <View style={styles.searchBox}>
          {viewIcon(vw(5), vw(5))}
          <TextInput
            testID="watchlist-search"
            style={styles.searchInput}
            placeholder={t('watchlist.search')}
            placeholderTextColor="#76787E"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>
        {search.active ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('watchlist.results')}</Text>
            {search.searching ? (
              <ActivityIndicator color="#FFED4B" />
            ) : search.failed ? (
              <Text style={styles.emptySubText}>{t('search.failed')}</Text>
            ) : search.results.length === 0 ? (
              <Text style={styles.emptySubText}>
                {t('search.noResults', {query: searchText.trim()})}
              </Text>
            ) : (
              search.results.map(result => (
                <StockRow
                  key={result.symbol}
                  symbol={result.symbol}
                  name={result.name}
                  subtitle={`${result.name} · ${result.exchange}`}
                  quote={quotes[result.symbol]}
                  onPress={() =>
                    navigation.navigate('ChartInfor', {symbol: result.symbol})
                  }
                  right={toggleButton(result.symbol, 'search-toggle')}
                />
              ))
            )}
          </View>
        ) : null}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('watchlist.count')}</Text>
            <Text style={styles.statValue}>{data.watchlist.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('watchlist.upDown')}</Text>
            <Text style={styles.statValue}>
              {up} / {watchedQuotes.length - up}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('watchlist.avgChange')}</Text>
            <Text style={[styles.statValue, {color: changeColor(avgChange)}]}>
              {formatPercent(avgChange)}
            </Text>
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('watchlist.following', {count: data.watchlist.length})}
            </Text>
            <TouchableOpacity
              testID="watchlist-sort"
              style={styles.headerButton}
              onPress={() => setSortIndex((sortIndex + 1) % SORTS.length)}>
              <Text style={styles.headerButtonText}>
                {t('watchlist.sort', {by: t(sort.label)})}
              </Text>
            </TouchableOpacity>
          </View>
          {watched.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('watchlist.empty')}</Text>
              <Text style={styles.emptySubText}>
                {t('watchlist.emptyDesc')}
              </Text>
            </View>
          ) : (
            watched.map(symbol => (
              <StockRow
                key={symbol}
                testID={`watchlist-row-${symbol}`}
                symbol={symbol}
                quote={quotes[symbol]}
                onPress={() => navigation.navigate('ChartInfor', {symbol})}
                right={toggleButton(symbol, 'watch-toggle')}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const sortSymbols = (
  symbols: string[],
  quotes: Record<string, Quote | undefined>,
  key: SortKey,
) => {
  if (key === 'default') {
    return symbols;
  }
  const value = (symbol: string) => {
    const quote = quotes[symbol];
    if (key === 'change') {
      return -(quote?.changePercent ?? -Infinity);
    }
    if (key === 'price') {
      return -(quote?.price ?? -Infinity);
    }
    return 0;
  };
  return [...symbols].sort((a, b) =>
    key === 'name' ? a.localeCompare(b) : value(a) - value(b),
  );
};

export default Watchlist;

const styles = StyleSheet.create({
  container: container,
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: vw(5),
  },
  headerButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: vw(3),
    paddingVertical: vh(1),
    borderRadius: vw(2),
  },
  headerButtonText: {
    color: '#FFED4B',
    fontSize: 12,
    fontWeight: '500',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    paddingHorizontal: vw(4),
    paddingVertical: vh(1.5),
    columnGap: vw(2),
    marginBottom: vh(2),
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(2),
  },
  statCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(2),
    padding: vw(3),
    alignItems: 'center',
    flex: 1,
    marginHorizontal: vw(1),
  },
  statLabel: {
    color: '#76787E',
    fontSize: 12,
    marginBottom: vh(0.5),
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: vh(3),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: vh(1.5),
  },
  emptyContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(6),
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: vh(1),
  },
  emptySubText: {
    color: '#76787E',
    fontSize: 14,
    textAlign: 'center',
  },
  watchlistButton: {
    padding: vw(1),
  },
  heartContainer: {
    padding: vw(1.5),
    borderRadius: vw(3),
    borderWidth: 1,
    borderColor: '#76787E',
  },
});
