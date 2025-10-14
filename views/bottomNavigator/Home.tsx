/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import useStatusBar from '../../services/useStatusBar';
import {container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import {addIcon, notiIcon, stocklineIcon, viewIcon} from '../../assets/svgXML';
import {
  StockHomeData1Interface,
  StockHomeData2Interface,
} from '../../services/typeProps';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  stockHomeData1,
  stockHomeData2,
  StockHomeData3,
} from '../../services/renderData';

const Home = () => {
  useStatusBar('#1A1A1A');
  const stockData1: StockHomeData1Interface[] = stockHomeData1;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <InforView />
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{columnGap: vw(3), paddingVertical: vh(2)}}>
            {stockData1.map((item, index) => {
              return (
                <View key={index}>
                  <RenderStockData1
                    name={item.name}
                    logo={item.logo}
                    shortName={item.shortName}
                    isIncrease={item.isIncrease}
                    value={item.value}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>
        <FollowView />
        <StockView />
      </ScrollView>
    </SafeAreaView>
  );
};

const StockView: React.FC = () => {
  return (
    <View style={styles.stockViewContainer}>
      <Text style={styles.followHeaderTxT}>Cổ phiếu</Text>
      <View>
        {StockHomeData3.map((item, index) => {
          return (
            <View style={styles.stock3Container} key={index}>
              <View style={{flexDirection: 'row', columnGap: vw(2)}}>
                <Image source={item.logo} />
                <View>
                  <Text style={styles.stock3Title}>{item.shortName}</Text>
                  <Text style={styles.stock3Sub}>{item.name}</Text>
                </View>
              </View>
              <Image source={item.chart} />
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.stock3Title}>${item.amount}</Text>
                <Text style={{color: '#5DC172', fontSize: 12}}>
                  + {item.value}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const FollowView: React.FC = () => {
  const stockData2: StockHomeData2Interface[] = stockHomeData2;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleNavigateToWatchlist = () => {
    navigation.navigate('Watchlist');
  };

  return (
    <View>
      <View style={styles.followHeader}>
        <Text style={styles.followHeaderTxT}>Theo dõi</Text>
        <TouchableOpacity onPress={handleNavigateToWatchlist}>
          {addIcon(vw(7), vw(7))}
        </TouchableOpacity>
      </View>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{columnGap: vw(2)}}>
          {stockData2.map((item, index) => {
            return (
              <View
                key={index}
                style={[styles.stockContainer, {backgroundColor: '#2C2C2C'}]}>
                <View style={styles.topRow}>
                  {item.logo ? (
                    <Image source={item.logo} style={styles.logo} />
                  ) : (
                    <View style={styles.circle}>
                      <Text style={styles.circleText}>
                        {item.shortName.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.column}>
                    <Text style={styles.nameText}>{item.name}</Text>
                    <Text style={styles.shortNameText}>{item.shortName}</Text>
                  </View>
                </View>
                <View style={styles.bottomRow}>
                  <Text
                    style={[
                      styles.valueText,
                      {color: item.isIncrease ? '#00FF00' : '#FF0000'},
                    ]}>
                    {item.isIncrease ? '+' : '-'}
                    {item.value}%
                  </Text>
                  <Image
                    source={item.chart}
                    style={{
                      width: vw(40),
                      height: vw(20),
                      resizeMode: 'cover',
                    }}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const RenderStockData1: React.FC<StockHomeData1Interface> = ({
  name,
  logo,
  shortName,
  isIncrease,
  value,
}) => {
  return (
    <View style={styles.stockContainer1}>
      <View style={styles.row}>
        {logo ? (
          <Image source={logo} style={styles.logo} />
        ) : (
          <View style={styles.circle}>
            <Text style={styles.circleText}>{shortName.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.column}>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.shortNameText}>{shortName}</Text>
        </View>
        <Text
          style={[
            styles.valueText,
            isIncrease ? styles.increaseText : styles.decreaseText,
          ]}>
          {isIncrease ? '+' : '-'}
          {value}%
        </Text>
      </View>
    </View>
  );
};

const InforView: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.inforContainer}>
      <View style={{rowGap: vh(1)}}>
        <Text style={styles.inforLabel}>Tổng danh mục đầu tư</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {isVisible ? (
            <Text style={styles.inforTxT}>$13,240.11 </Text>
          ) : (
            <Text style={styles.inforTxT}>$******* </Text>
          )}
          <TouchableOpacity
            onPress={() => {
              setIsVisible(!isVisible);
            }}>
            {viewIcon(vw(4), vw(4))}
          </TouchableOpacity>
        </View>
      </View>
      <Image source={require('../../assets/home/chart1.png')} />
    </View>
  );
};

const Header: React.FC = () => {
  return (
    <View style={styles.headerContainer}>
      <View
        style={{columnGap: vw(2), flexDirection: 'row', alignItems: 'center'}}>
        {stocklineIcon(vw(7), vw(7))}
        <Text style={styles.headerTxT}>Stockline</Text>
      </View>
      {notiIcon(vw(7), vw(7))}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: container,
  scrollContainer: {flexGrow: 1, paddingHorizontal: vw(5)},
  headerContainer: {
    paddingVertical: vh(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTxT: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inforContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inforTxT: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inforLabel: {
    color: '#76787E',
  },
  stockContainer1: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#FFED4B',
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: 'yellow',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nameText: {
    color: '#FFFFFF',
  },
  shortNameText: {
    color: '#76787E',
  },
  valueText: {
    color: '#FFFFFF',
    marginLeft: 10,
  },
  increaseText: {
    color: '#00FF00',
    marginLeft: 5,
  },
  decreaseText: {
    color: '#FF0000',
    marginLeft: 5,
  },
  followHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vh(1),
  },
  followHeaderTxT: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  stockContainer: {
    width: vw(80),
    padding: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  chart: {
    width: 60,
    height: 30,
  },
  stockViewContainer: {
    paddingVertical: vh(2),
  },
  stock3Container: {
    width: '100%',
    paddingVertical: vh(1.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stock3Title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stock3Sub: {
    color: '#76787E',
    fontSize: 12,
    fontWeight: '400',
  },
});
