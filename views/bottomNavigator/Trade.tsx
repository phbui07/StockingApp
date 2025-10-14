/* eslint-disable react-native/no-inline-styles */
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import React, {useState, useCallback} from 'react';
import {container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import useStatusBar from '../../services/useStatusBar';
import {LineChart} from 'react-native-gifted-charts';
import {
  arrowUpIcon,
  arrowDownIcon,
} from '../../assets/svgXML';
import BiometricAuth from '../../services/biometricAuth';
import {LoadingOverlay} from '../../components/LoadingComponent';

interface TradeTransaction {
  id: string;
  type: 'BUY' | 'SELL';
  stock: {
    name: string;
    shortName: string;
    logo: any;
  };
  quantity: number;
  price: number;
  total: number;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
}

interface TradingStats {
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  totalLoss: number;
  winRate: number;
}

const mockTradeData: TradeTransaction[] = [
  {
    id: '1',
    type: 'BUY',
    stock: {
      name: 'Apple Inc.',
      shortName: 'AAPL',
      logo: require('../../assets/home/apple.png'),
    },
    quantity: 10,
    price: 140.0,
    total: 1400.0,
    date: '2024-10-14',
    status: 'COMPLETED',
  },
  {
    id: '2',
    type: 'SELL',
    stock: {
      name: 'Netflix Inc.',
      shortName: 'NFLX',
      logo: require('../../assets/home/netflix.png'),
    },
    quantity: 2,
    price: 720.0,
    total: 1440.0,
    date: '2024-10-13',
    status: 'COMPLETED',
  },
  {
    id: '3',
    type: 'BUY',
    stock: {
      name: 'Facebook Inc.',
      shortName: 'FB',
      logo: require('../../assets/home/facebook.png'),
    },
    quantity: 5,
    price: 330.0,
    total: 1650.0,
    date: '2024-10-12',
    status: 'PENDING',
  },
  {
    id: '4',
    type: 'SELL',
    stock: {
      name: 'Amazon, Inc.',
      shortName: 'AMZN',
      logo: require('../../assets/home/amazon.png'),
    },
    quantity: 1,
    price: 3150.0,
    total: 3150.0,
    date: '2024-10-11',
    status: 'CANCELLED',
  },
];

const mockTradingStats: TradingStats = {
  totalTrades: 24,
  successfulTrades: 18,
  totalProfit: 2540.85,
  totalLoss: 856.23,
  winRate: 75,
};

const profitLossData = [
  {value: 100, date: '1/10'},
  {value: 250, date: '2/10'},
  {value: 180, date: '3/10'},
  {value: 420, date: '4/10'},
  {value: 320, date: '5/10'},
  {value: 580, date: '6/10'},
  {value: 480, date: '7/10'},
];

const Trade = () => {
  useStatusBar('#1A1A1A');
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleSecureAction = async (actionName: string) => {
    setIsProcessing(true);
    try {
      const authResult = await BiometricAuth.authenticateWithBiometrics(
        `Xác thực để ${actionName}`
      );
      
      if (authResult.success) {
        // Proceed with action
        console.log(`${actionName} authenticated successfully`);
      } else {
        console.log('Authentication failed:', authResult.error);
      }
    } catch (error) {
      console.log('Authentication error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

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
        <Header onSecureAction={handleSecureAction} />
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'overview' ? (
          <OverviewContent stats={mockTradingStats} />
        ) : (
          <HistoryContent transactions={mockTradeData} />
        )}
      </ScrollView>
      {isProcessing && <LoadingOverlay message="Đang xác thực..." />}
    </SafeAreaView>
  );
};

const Header: React.FC<{
  onSecureAction?: (actionName: string) => void;
}> = ({onSecureAction}) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>Giao dịch</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSecureAction?.('mua cổ phiếu')}>
          <Text style={styles.actionButtonText}>Mua</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.sellButton]}
          onPress={() => onSecureAction?.('bán cổ phiếu')}>
          <Text style={[styles.actionButtonText, {color: '#FFFFFF'}]}>Bán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TabSelector: React.FC<{
  activeTab: 'overview' | 'history';
  setActiveTab: (tab: 'overview' | 'history') => void;
}> = ({activeTab, setActiveTab}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'overview' && styles.activeTabText,
          ]}>
          Tổng quan
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'history' && styles.activeTab]}
        onPress={() => setActiveTab('history')}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'history' && styles.activeTabText,
          ]}>
          Lịch sử
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const OverviewContent: React.FC<{stats: TradingStats}> = ({stats}) => {
  return (
    <View>
      <TradingStatsCard stats={stats} />
      <ProfitLossChart />
      <QuickActions />
    </View>
  );
};

const TradingStatsCard: React.FC<{stats: TradingStats}> = ({stats}) => {
  const netProfitLoss = stats.totalProfit - stats.totalLoss;
  const isProfit = netProfitLoss >= 0;

  return (
    <View style={styles.statsCard}>
      <Text style={styles.cardTitle}>Thống kê giao dịch</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalTrades}</Text>
          <Text style={styles.statLabel}>Tổng GD</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.winRate}%</Text>
          <Text style={styles.statLabel}>Tỷ lệ thắng</Text>
        </View>
      </View>

      <View style={styles.profitLossContainer}>
        <View
          style={[
            styles.profitLossIndicator,
            {backgroundColor: isProfit ? '#5DC172' : '#FF4444'},
          ]}>
          {isProfit
            ? arrowUpIcon(vw(4), vw(4), '#FFFFFF')
            : arrowDownIcon(vw(4), vw(4), '#FFFFFF')}
        </View>
        <View>
          <Text style={styles.profitLossLabel}>Lãi/Lỗ ròng</Text>
          <Text
            style={[
              styles.profitLossValue,
              {color: isProfit ? '#5DC172' : '#FF4444'},
            ]}>
            {isProfit ? '+' : ''}${netProfitLoss.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const ProfitLossChart: React.FC = () => {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.cardTitle}>Biểu đồ lãi/lỗ (7 ngày)</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={profitLossData}
          width={Dimensions.get('window').width - vw(10)}
          height={200}
          color="#FFED4B"
          thickness={3}
          startFillColor="#FFED4B"
          endFillColor="#FFED4B"
          startOpacity={0.3}
          endOpacity={0.1}
          initialSpacing={0}
          noOfSections={4}
          yAxisColor="#76787E"
          xAxisColor="#76787E"
          yAxisTextStyle={{color: '#76787E'}}
          xAxisLabelTextStyle={{color: '#76787E'}}
          hideDataPoints={false}
          dataPointsColor="#FFED4B"
          dataPointsRadius={4}
        />
      </View>
    </View>
  );
};

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Lệnh chờ',
      subtitle: '3 lệnh đang chờ',
      icon: '⏳',
      color: '#FFB800',
    },
    {
      title: 'Danh sách theo dõi',
      subtitle: '12 cổ phiếu',
      icon: '⭐',
      color: '#5DC172',
    },
    {
      title: 'Cảnh báo giá',
      subtitle: '5 cảnh báo',
      icon: '🔔',
      color: '#FF6B6B',
    },
  ];

  return (
    <View style={styles.quickActionsCard}>
      <Text style={styles.cardTitle}>Thao tác nhanh</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionItem}>
            <View
              style={[styles.actionIcon, {backgroundColor: action.color}]}>
              <Text style={styles.actionIconText}>{action.icon}</Text>
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const HistoryContent: React.FC<{transactions: TradeTransaction[]}> = ({
  transactions,
}) => {
  return (
    <View style={styles.historyContainer}>
      <Text style={styles.sectionTitle}>
        Lịch sử giao dịch ({transactions.length})
      </Text>
      {transactions.map(transaction => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </View>
  );
};

const TransactionCard: React.FC<{transaction: TradeTransaction}> = ({
  transaction,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#5DC172';
      case 'PENDING':
        return '#FFB800';
      case 'CANCELLED':
        return '#FF4444';
      default:
        return '#76787E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <Image source={transaction.stock.logo} style={styles.transactionLogo} />
          <View>
            <Text style={styles.transactionStock}>
              {transaction.stock.shortName}
            </Text>
            <Text style={styles.transactionDate}>{transaction.date}</Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <View
            style={[
              styles.typeIndicator,
              {
                backgroundColor:
                  transaction.type === 'BUY' ? '#5DC172' : '#FF4444',
              },
            ]}>
            <Text style={styles.typeText}>{transaction.type}</Text>
          </View>
          <View
            style={[
              styles.statusIndicator,
              {backgroundColor: getStatusColor(transaction.status)},
            ]}>
            <Text style={styles.statusText}>
              {getStatusText(transaction.status)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Số lượng:</Text>
          <Text style={styles.detailValue}>{transaction.quantity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Giá:</Text>
          <Text style={styles.detailValue}>${transaction.price.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tổng:</Text>
          <Text style={styles.detailValue}>${transaction.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

export default Trade;

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
  headerActions: {
    flexDirection: 'row',
    columnGap: vw(2),
  },
  actionButton: {
    backgroundColor: '#FFED4B',
    paddingHorizontal: vw(4),
    paddingVertical: vh(1),
    borderRadius: vw(2),
  },
  sellButton: {
    backgroundColor: '#FF4444',
  },
  actionButtonText: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2C',
    borderRadius: vw(2),
    marginBottom: vh(2),
    padding: vw(1),
  },
  tab: {
    flex: 1,
    paddingVertical: vh(1.5),
    alignItems: 'center',
    borderRadius: vw(1.5),
  },
  activeTab: {
    backgroundColor: '#FFED4B',
  },
  tabText: {
    color: '#76787E',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1A1A1A',
  },
  statsCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(4),
    marginBottom: vh(2),
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: vh(2),
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(2),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  statLabel: {
    color: '#76787E',
    fontSize: 14,
  },
  profitLossContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: vw(3),
  },
  profitLossIndicator: {
    borderRadius: vw(3),
    padding: vw(1.5),
  },
  profitLossLabel: {
    color: '#76787E',
    fontSize: 14,
  },
  profitLossValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(4),
    marginBottom: vh(2),
  },
  chartContainer: {
    alignItems: 'center',
  },
  quickActionsCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(4),
    marginBottom: vh(2),
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: vw(12),
    height: vw(12),
    borderRadius: vw(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vh(1),
  },
  actionIconText: {
    fontSize: 18,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionSubtitle: {
    color: '#76787E',
    fontSize: 10,
    textAlign: 'center',
  },
  historyContainer: {
    marginVertical: vh(1),
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: vh(2),
  },
  transactionCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(4),
    marginBottom: vh(1.5),
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(1.5),
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: vw(3),
  },
  transactionLogo: {
    width: vw(10),
    height: vw(10),
    borderRadius: vw(5),
  },
  transactionStock: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  transactionDate: {
    color: '#76787E',
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
    rowGap: vh(0.5),
  },
  typeIndicator: {
    paddingHorizontal: vw(2),
    paddingVertical: vh(0.5),
    borderRadius: vw(1),
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  statusIndicator: {
    paddingHorizontal: vw(2),
    paddingVertical: vh(0.5),
    borderRadius: vw(1),
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#404040',
    paddingTop: vh(1.5),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(0.5),
  },
  detailLabel: {
    color: '#76787E',
    fontSize: 14,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
