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
import {centerAll, container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import useStatusBar from '../../services/useStatusBar';
import {useNavigation, useRoute} from '@react-navigation/native';
import {backIcon, notiIcon} from '../../assets/svgXML';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  barData,
  ChartInforPageData,
  IntroduceCompanyData,
  StockHomeData3,
} from '../../services/renderData';
import {BarChart} from 'react-native-gifted-charts/dist/BarChart';

const ChartInfor = () => {
  useStatusBar('#1A1A1A');
  const route = useRoute();
  const {itemIndex} = route.params as {itemIndex: number};
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header />
        <BannerView itemIndex={itemIndex} />
        <ChartView />
        <TabView itemIndex={itemIndex} />
        <View style={{paddingHorizontal: vw(5)}}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('BuyingVerify', {dataIndex: itemIndex});
            }}
            style={styles.buyBtn}>
            <Text style={{color: '#1A1A1A', fontWeight: '600'}}>Mua</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const TabView: React.FC<{itemIndex: number}> = ({itemIndex}) => {
  const [activeTab, setActiveTab] = useState('introduce');

  return (
    <View style={styles.container1}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'introduce' && styles.activeTab]}
          onPress={() => setActiveTab('introduce')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'introduce' && {color: 'black'},
            ]}>
            Giới thiệu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'detail' && styles.activeTab]}
          onPress={() => setActiveTab('detail')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'detail' && {color: 'black'},
            ]}>
            Chi tiết
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'introduce' && <IntroduceView itemIndex={itemIndex} />}
      {activeTab === 'detail' && <DetailView itemIndex={itemIndex} />}
    </View>
  );
};

const IntroduceView: React.FC<{itemIndex: number}> = ({itemIndex}) => {
  const companyData = IntroduceCompanyData[itemIndex];

  return (
    <View style={styles.scene}>
      <Text style={styles.text}>{companyData.briefDescription}</Text>
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>TRANG WEB:</Text>
          <Text style={styles.infoValue}>{companyData.website}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>NHÂN VIÊN:</Text>
          <Text style={styles.infoValue}>{companyData.employees}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>NGÀY THÀNH LẬP:</Text>
          <Text style={styles.infoValue}>{companyData.foundingData}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>TRỤ SỞ CHÍNH:</Text>
          <Text style={styles.infoValue}>{companyData.headquarters}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>GIÁM ĐỐC ĐIỀU HÀNH:</Text>
          <Text style={styles.infoValue}>{companyData.ceo}</Text>
        </View>
      </View>
    </View>
  );
};

const DetailView: React.FC<{itemIndex: number}> = () => (
  <View style={[styles.scene, {rowGap: vh(1)}]}>
    <View style={{width: '100%'}}>
      <Text style={{color: 'white', fontSize: 18, fontWeight: '600'}}>
        Kết qủa kinh doanh
      </Text>
    </View>
    <View
      style={{
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#76787E',
        padding: vw(5),
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View>
          <Text style={{color: 'white', fontSize: 18, fontWeight: '600'}}>
            Năm
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            columnGap: vw(2),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.blueDot} />
            <Text style={styles.greyTxt}>Doanh thu</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.yellowDot} />
            <Text style={styles.greyTxt}>Thu nhập ròng</Text>
          </View>
        </View>
      </View>
      <BarChart
        isAnimated
        data={barData}
        barWidth={20}
        spacing={40}
        roundedTop
        hideYAxisText
        hideRules
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={{color: 'gray'}}
        noOfSections={3}
        renderTooltip={(item: any, index: number) => {
          return (
            <View
              key={index}
              style={{
                position: 'absolute',
                bottom: -vh(10),
                left: vw(8),
                backgroundColor: 'white',
                paddingHorizontal: 6,
                paddingVertical: 4,
                borderRadius: 4,
              }}>
              <Text style={{color: '#1A1A1A', fontWeight: '600'}}>
                {item.value} tỷ
              </Text>
            </View>
          );
        }}
      />
    </View>
  </View>
);

const ChartView: React.FC = () => {
  return (
    <View style={[centerAll, {marginVertical: vh(2)}]}>
      <View style={{width: vw(90), overflow: 'hidden'}}>
        <BarChart
          isAnimated
          data={ChartInforPageData}
          barWidth={8}
          initialSpacing={60}
          endSpacing={60}
          spacing={30}
          barBorderRadius={4}
          showGradient
          yAxisThickness={0}
          xAxisType={'dashed'}
          xAxisColor={'#76787E'}
          hideYAxisText
          stepValue={500}
          maxValue={2000}
          noOfSections={6}
          labelWidth={40}
          xAxisLabelTextStyle={{color: '#76787E', textAlign: 'center'}}
          showLine
          lineConfig={{
            color: '#FFED4B',
            thickness: 3,
            curved: true,
            hideDataPoints: true,
            shiftY: 20,
            initialSpacing: -30,
          }}
          renderTooltip={(item: any, index: number) => {
            return (
              <View
                key={index}
                style={{
                  zIndex: 10,
                  position: 'absolute',
                  bottom: -vh(10),
                  left: vw(8),
                  backgroundColor: '#FFED4B',
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}>
                <Text style={{color: '#1A1A1A', fontWeight: '600'}}>
                  ${item.value}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

const BannerView: React.FC<{itemIndex: number}> = ({itemIndex}) => {
  const amount = parseFloat(StockHomeData3[itemIndex].amount);
  const newAmount = amount + amount * 0.0014;
  return (
    <View style={styles.stockContainer}>
      <View style={styles.stock3Container}>
        <View style={styles.stockContent}>
          <View style={styles.stockContent1}>
            <Image source={StockHomeData3[itemIndex].logo} />
            <View>
              <Text style={styles.stock3Title}>
                {StockHomeData3[itemIndex].shortName}
              </Text>
              <Text style={styles.stock3Sub}>
                {StockHomeData3[itemIndex].name}
              </Text>
            </View>
          </View>
          {notiIcon(vw(5), vw(5), 'black')}
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: vw(3),
        }}>
        <View>
          <Text style={styles.whiteTxt}>
            ${StockHomeData3[itemIndex].amount}
          </Text>
          <Text>
            <Text style={styles.yellowTxt}>++33,82</Text>{' '}
            <Text style={styles.greenTxt}>(+4,91%%)</Text>{' '}
            <Text style={styles.greyTxt}>Tháng trước</Text>
          </Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.whiteTxt}>${newAmount.toFixed(2)}</Text>
          <Text style={styles.yellowTxt}>+0,14 (+0,030%)</Text>
        </View>
      </View>
    </View>
  );
};

const Header: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <View style={[centerAll, {paddingVertical: vh(3)}]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          navigation.goBack();
        }}>
        {backIcon(vw(6), vw(6), '#76787E')}
      </TouchableOpacity>
      <Text style={styles.headerTxt}>Thông tin cổ phiếu</Text>
    </View>
  );
};

export default ChartInfor;

const styles = StyleSheet.create({
  container: container,
  headerTxt: {color: '#FFFFFF', fontSize: 14, fontWeight: '600'},
  backBtn: {
    position: 'absolute',
    left: vw(5),
    borderWidth: 1,
    borderColor: '#76787E',
    borderRadius: 10,
    padding: vw(1.5),
  },
  stockContainer: {
    paddingHorizontal: vw(5),
    rowGap: vh(2),
  },
  stock3Container: {
    borderRadius: 6,
    width: '100%',
    backgroundColor: '#FFED4B',
    paddingVertical: vh(1.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: vw(2),
  },
  stock3Title: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },
  stock3Sub: {
    color: '#76787E',
    fontSize: 12,
    fontWeight: '400',
  },
  stockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  stockContent1: {
    flexDirection: 'row',
    columnGap: vw(2),
    alignItems: 'center',
  },
  yellowTxt: {
    color: '#FFED4B',
    fontSize: 12,
    fontWeight: '500',
  },
  greenTxt: {
    color: '#5DC172',
    fontSize: 12,
    fontWeight: '500',
  },
  greyTxt: {
    color: '#76787E',
    fontSize: 12,
    fontWeight: '500',
  },
  whiteTxt: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  container1: {
    flex: 1,
    paddingHorizontal: vw(5),
    marginVertical: vh(2),
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    padding: 16,
    width: '50%',
  },
  activeTab: {
    backgroundColor: '#FFED4B',
    borderRadius: 12,
  },
  tabText: {
    color: '#76787E',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  scene: {
    paddingVertical: vh(2),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: vw(3),
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  infoContainer: {
    width: '100%',
    marginVertical: vh(2),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoKey: {
    color: '#76787E',
    fontSize: 14,
    width: '50%',
  },
  infoValue: {
    color: '#FFED4B',
    fontSize: 14,
    width: '50%',
    textAlign: 'left',
  },
  blueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7DC1F1',
    marginRight: 5,
  },
  yellowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFED4B',
    marginRight: 5,
  },
  buyBtn: {
    backgroundColor: '#FFED4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vh(4),
    borderRadius: 16,
    paddingVertical: vh(2),
  },
});
