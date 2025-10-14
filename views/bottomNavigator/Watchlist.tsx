/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  RefreshControl,
} from 'react-native';
import React, {useState, useCallback} from 'react';
import {container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import useStatusBar from '../../services/useStatusBar';
import {
  arrowUpIcon,
  arrowDownIcon,
  viewIcon,
  addIcon,
} from '../../assets/svgXML';

interface WatchlistStock {
  id: string;
  name: string;
  shortName: string;
  logo: any;
  currentPrice: number;
  change: number;
  changePercent: number;
  isInWatchlist: boolean;
}

const mockWatchlistData: WatchlistStock[] = [
  {
    id: '1',
    name: 'Apple Inc.',
    shortName: 'AAPL',
    logo: require('../../assets/home/apple.png'),
    currentPrice: 142.26,
    change: 2.26,
    changePercent: 1.61,
    isInWatchlist: true,
  },
  {
    id: '2',
    name: 'Netflix Inc.',
    shortName: 'NFLX',
    logo: require('../../assets/home/netflix.png'),
    currentPrice: 722.26,
    change: 11.3,
    changePercent: 3.18,
    isInWatchlist: true,
  },
  {
    id: '3',
    name: 'Facebook Inc.',
    shortName: 'FB',
    logo: require('../../assets/home/facebook.png'),
    currentPrice: 343.6,
    change: 8.8,
    changePercent: 2.12,
    isInWatchlist: true,
  },
  {
    id: '4',
    name: 'Tesla Inc.',
    shortName: 'TSLA',
    logo: require('../../assets/home/amazon.png'), // Tạm dùng amazon logo
    currentPrice: 256.13,
    change: -11.61,
    changePercent: -1.37,
    isInWatchlist: false,
  },
  {
    id: '5',
    name: 'Microsoft Corp.',
    shortName: 'MSFT',
    logo: require('../../assets/home/adobe.png'), // Tạm dùng adobe logo
    currentPrice: 378.85,
    change: 5.42,
    changePercent: 1.45,
    isInWatchlist: false,
  },
];

const Watchlist = () => {
  useStatusBar('#1A1A1A');
  const [searchText, setSearchText] = useState('');
  const [watchlistStocks, setWatchlistStocks] = useState(mockWatchlistData);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      // Update prices with random changes
      setWatchlistStocks(prev =>
        prev.map(stock => ({
          ...stock,
          currentPrice: stock.currentPrice + (Math.random() - 0.5) * 10,
          change: (Math.random() - 0.5) * 20,
          changePercent: (Math.random() - 0.5) * 5,
        }))
      );
      setRefreshing(false);
    }, 1500);
  }, []);

  const toggleWatchlist = (stockId: string) => {
    setWatchlistStocks(prev =>
      prev.map(stock =>
        stock.id === stockId
          ? {...stock, isInWatchlist: !stock.isInWatchlist}
          : stock
      )
    );
  };

  const filteredStocks = watchlistStocks.filter(stock =>
    stock.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const watchlistOnly = filteredStocks.filter(stock => stock.isInWatchlist);
  const availableStocks = filteredStocks.filter(stock => !stock.isInWatchlist);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFED4B"
            colors={['#FFED4B']}
          />
        }>
        <Header />
        <SearchSection searchText={searchText} setSearchText={setSearchText} />
        <QuickStats stocks={watchlistOnly} />
        <WatchlistSection
          stocks={watchlistOnly}
          onToggleWatchlist={toggleWatchlist}
        />
        <AvailableStocksSection
          stocks={availableStocks}
          onToggleWatchlist={toggleWatchlist}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const Header: React.FC = () => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>Danh sách theo dõi</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Sắp xếp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SearchSection: React.FC<{
  searchText: string;
  setSearchText: (text: string) => void;
}> = ({searchText, setSearchText}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBox}>
        {viewIcon(vw(5), vw(5))}
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm cổ phiếu..."
          placeholderTextColor="#76787E"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
    </View>
  );
};

const QuickStats: React.FC<{stocks: WatchlistStock[]}> = ({stocks}) => {
  const totalValue = stocks.reduce((sum, stock) => sum + stock.currentPrice, 0);
  const totalChange = stocks.reduce((sum, stock) => sum + stock.change, 0);
  const avgChangePercent = totalChange / stocks.length || 0;

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Tổng cổ phiếu</Text>
        <Text style={styles.statValue}>{stocks.length}</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Giá trị trung bình</Text>
        <Text style={styles.statValue}>${(totalValue / stocks.length || 0).toFixed(2)}</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Thay đổi TB</Text>
        <Text
          style={[
            styles.statValue,
            {color: avgChangePercent >= 0 ? '#5DC172' : '#FF4444'},
          ]}>
          {avgChangePercent >= 0 ? '+' : ''}
          {avgChangePercent.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
};

const WatchlistSection: React.FC<{
  stocks: WatchlistStock[];
  onToggleWatchlist: (id: string) => void;
}> = ({stocks, onToggleWatchlist}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        Đang theo dõi ({stocks.length})
      </Text>
      {stocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Chưa có cổ phiếu nào trong danh sách theo dõi
          </Text>
          <Text style={styles.emptySubText}>
            Thêm cổ phiếu bên dưới để bắt đầu theo dõi
          </Text>
        </View>
      ) : (
        stocks.map(stock => (
          <StockCard
            key={stock.id}
            stock={stock}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))
      )}
    </View>
  );
};

const AvailableStocksSection: React.FC<{
  stocks: WatchlistStock[];
  onToggleWatchlist: (id: string) => void;
}> = ({stocks, onToggleWatchlist}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Cổ phiếu khác ({stocks.length})</Text>
      {stocks.map(stock => (
        <StockCard
          key={stock.id}
          stock={stock}
          onToggleWatchlist={onToggleWatchlist}
        />
      ))}
    </View>
  );
};

const StockCard: React.FC<{
  stock: WatchlistStock;
  onToggleWatchlist: (id: string) => void;
}> = ({stock, onToggleWatchlist}) => {
  return (
    <View style={styles.stockCard}>
      <View style={styles.stockLeft}>
        <Image source={stock.logo} style={styles.stockLogo} />
        <View style={styles.stockInfo}>
          <Text style={styles.stockName}>{stock.shortName}</Text>
          <Text style={styles.stockFullName}>{stock.name}</Text>
        </View>
      </View>
      
      <View style={styles.stockCenter}>
        <Text style={styles.stockPrice}>${stock.currentPrice.toFixed(2)}</Text>
        <View style={styles.changeContainer}>
          <View
            style={[
              styles.changeIndicator,
              {backgroundColor: stock.change >= 0 ? '#5DC172' : '#FF4444'},
            ]}>
            {stock.change >= 0
              ? arrowUpIcon(vw(3), vw(3), '#FFFFFF')
              : arrowDownIcon(vw(3), vw(3), '#FFFFFF')}
          </View>
          <Text
            style={[
              styles.changeText,
              {color: stock.change >= 0 ? '#5DC172' : '#FF4444'},
            ]}>
            {stock.change >= 0 ? '+' : ''}
            {stock.changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.watchlistButton}
        onPress={() => onToggleWatchlist(stock.id)}>
        <View
          style={[
            styles.heartContainer,
            {backgroundColor: stock.isInWatchlist ? '#FFED4B' : 'transparent'},
          ]}>
          {addIcon(vw(5), vw(5), stock.isInWatchlist ? '#1A1A1A' : '#76787E')}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Watchlist;

const styles = StyleSheet.create({
  container: container,
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: vw(5),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vh(2),
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: vw(3),
    paddingVertical: vh(1),
    borderRadius: vw(2),
  },
  headerButtonText: {
    color: '#FFED4B',
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: vh(2),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    paddingHorizontal: vw(4),
    paddingVertical: vh(1.5),
    columnGap: vw(2),
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
  stockCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(4),
    marginBottom: vh(1.5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockLogo: {
    width: vw(12),
    height: vw(12),
    borderRadius: vw(6),
    marginRight: vw(3),
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stockFullName: {
    color: '#76787E',
    fontSize: 12,
  },
  stockCenter: {
    alignItems: 'flex-end',
    marginRight: vw(3),
  },
  stockPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: vw(1),
    marginTop: vh(0.5),
  },
  changeIndicator: {
    borderRadius: vw(1),
    padding: vw(0.5),
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  watchlistButton: {
    padding: vw(2),
  },
  heartContainer: {
    padding: vw(1.5),
    borderRadius: vw(3),
    borderWidth: 1,
    borderColor: '#76787E',
  },
});