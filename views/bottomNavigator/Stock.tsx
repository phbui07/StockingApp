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
  addIcon,
  arrowUpIcon,
  arrowDownIcon,
  viewIcon,
} from '../../assets/svgXML';

interface StockItem {
  id: string;
  name: string;
  shortName: string;
  logo: any;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  totalValue: number;
  change: number;
  changePercent: number;
}

const mockStockData: StockItem[] = [
  {
    id: '1',
    name: 'Apple Inc.',
    shortName: 'AAPL',
    logo: require('../../assets/home/apple.png'),
    quantity: 10,
    buyPrice: 140.0,
    currentPrice: 142.26,
    totalValue: 1422.6,
    change: 22.6,
    changePercent: 1.61,
  },
  {
    id: '2',
    name: 'Netflix Inc.',
    shortName: 'NFLX',
    logo: require('../../assets/home/netflix.png'),
    quantity: 5,
    buyPrice: 700.0,
    currentPrice: 722.26,
    totalValue: 3611.3,
    change: 111.3,
    changePercent: 3.18,
  },
  {
    id: '3',
    name: 'Facebook Inc.',
    shortName: 'FB',
    logo: require('../../assets/home/facebook.png'),
    quantity: 8,
    buyPrice: 330.0,
    currentPrice: 343.6,
    totalValue: 2748.8,
    change: 108.8,
    changePercent: 4.12,
  },
  {
    id: '4',
    name: 'Amazon, Inc.',
    shortName: 'AMZN',
    logo: require('../../assets/home/amazon.png'),
    quantity: 3,
    buyPrice: 3200.0,
    currentPrice: 3156.13,
    totalValue: 9468.39,
    change: -131.61,
    changePercent: -1.37,
  },
];

const Stock = () => {
  useStatusBar('#1A1A1A');
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call to refresh data
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const totalPortfolioValue = mockStockData.reduce(
    (sum, stock) => sum + stock.totalValue,
    0,
  );
  const totalGainLoss = mockStockData.reduce(
    (sum, stock) => sum + stock.change,
    0,
  );
  const totalGainLossPercent = (totalGainLoss / totalPortfolioValue) * 100;

  const filteredStocks = mockStockData.filter(stock => {
    const matchesSearch = stock.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    if (selectedFilter === 'gainers') {
      return matchesSearch && stock.change > 0;
    }
    if (selectedFilter === 'losers') {
      return matchesSearch && stock.change < 0;
    }
    return matchesSearch;
  });

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
        <PortfolioSummary
          totalValue={totalPortfolioValue}
          gainLoss={totalGainLoss}
          gainLossPercent={totalGainLossPercent}
        />
        <SearchAndFilter
          searchText={searchText}
          setSearchText={setSearchText}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
        <StocksList stocks={filteredStocks} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Header: React.FC = () => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>Danh mục sở hữu</Text>
      <TouchableOpacity style={styles.addButton}>
        {addIcon(vw(6), vw(6), '#1A1A1A')}
      </TouchableOpacity>
    </View>
  );
};

const PortfolioSummary: React.FC<{
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}> = ({totalValue, gainLoss, gainLossPercent}) => {
  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryLabel}>Tổng giá trị danh mục</Text>
      <Text style={styles.summaryValue}>${totalValue.toFixed(2)}</Text>
      <View style={styles.gainLossContainer}>
        <View
          style={[
            styles.changeIndicator,
            {backgroundColor: gainLoss >= 0 ? '#5DC172' : '#FF4444'},
          ]}>
          {gainLoss >= 0
            ? arrowUpIcon(vw(4), vw(4), '#FFFFFF')
            : arrowDownIcon(vw(4), vw(4), '#FFFFFF')}
        </View>
        <Text
          style={[
            styles.gainLossText,
            {color: gainLoss >= 0 ? '#5DC172' : '#FF4444'},
          ]}>
          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} (
          {gainLossPercent.toFixed(2)}%)
        </Text>
      </View>
    </View>
  );
};

const SearchAndFilter: React.FC<{
  searchText: string;
  setSearchText: (text: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}> = ({searchText, setSearchText, selectedFilter, setSelectedFilter}) => {
  const filters = [
    {key: 'all', label: 'Tất cả'},
    {key: 'gainers', label: 'Tăng'},
    {key: 'losers', label: 'Giảm'},
  ];

  return (
    <View style={styles.searchFilterContainer}>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.activeFilter,
            ]}
            onPress={() => setSelectedFilter(filter.key)}>
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.activeFilterText,
              ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const StocksList: React.FC<{stocks: StockItem[]}> = ({stocks}) => {
  return (
    <View style={styles.stocksListContainer}>
      <Text style={styles.sectionTitle}>Cổ phiếu sở hữu ({stocks.length})</Text>
      {stocks.map(stock => (
        <StockCard key={stock.id} stock={stock} />
      ))}
    </View>
  );
};

const StockCard: React.FC<{stock: StockItem}> = ({stock}) => {
  return (
    <View style={styles.stockCard}>
      <View style={styles.stockCardLeft}>
        <Image source={stock.logo} style={styles.stockLogo} />
        <View style={styles.stockInfo}>
          <Text style={styles.stockName}>{stock.shortName}</Text>
          <Text style={styles.stockFullName}>{stock.name}</Text>
          <Text style={styles.stockQuantity}>{stock.quantity} cổ phiếu</Text>
        </View>
      </View>
      <View style={styles.stockCardRight}>
        <Text style={styles.stockValue}>${stock.totalValue.toFixed(2)}</Text>
        <Text style={styles.stockPrice}>${stock.currentPrice.toFixed(2)}</Text>
        <View style={styles.stockChangeContainer}>
          <Text
            style={[
              styles.stockChange,
              {color: stock.change >= 0 ? '#5DC172' : '#FF4444'},
            ]}>
            {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
          </Text>
          <Text
            style={[
              styles.stockChangePercent,
              {color: stock.change >= 0 ? '#5DC172' : '#FF4444'},
            ]}>
            ({stock.changePercent >= 0 ? '+' : ''}
            {stock.changePercent.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Stock;

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
  addButton: {
    backgroundColor: '#FFED4B',
    borderRadius: vw(6),
    padding: vw(2),
  },
  summaryContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(4),
    marginVertical: vh(1),
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#76787E',
    fontSize: 14,
    marginBottom: vh(1),
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: vh(1),
  },
  gainLossContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: vw(2),
  },
  changeIndicator: {
    borderRadius: vw(3),
    padding: vw(1),
  },
  gainLossText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchFilterContainer: {
    marginVertical: vh(2),
  },
  searchContainer: {
    marginBottom: vh(1),
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
  filterContainer: {
    columnGap: vw(2),
  },
  filterButton: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(5),
    paddingHorizontal: vw(4),
    paddingVertical: vh(1),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilter: {
    backgroundColor: '#FFED4B',
    borderColor: '#FFED4B',
  },
  filterText: {
    color: '#76787E',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#1A1A1A',
  },
  stocksListContainer: {
    marginVertical: vh(2),
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: vh(2),
  },
  stockCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(4),
    marginBottom: vh(1.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockCardLeft: {
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
  stockQuantity: {
    color: '#76787E',
    fontSize: 11,
    marginTop: vh(0.5),
  },
  stockCardRight: {
    alignItems: 'flex-end',
  },
  stockValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stockPrice: {
    color: '#76787E',
    fontSize: 14,
  },
  stockChangeContainer: {
    alignItems: 'flex-end',
    marginTop: vh(0.5),
  },
  stockChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  stockChangePercent: {
    fontSize: 11,
  },
});
