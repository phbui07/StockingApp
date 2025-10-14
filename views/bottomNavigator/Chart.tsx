/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {centerAll, container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import useStatusBar from '../../services/useStatusBar';
import {increasingCircleIcon} from '../../assets/svgXML';
import {
  ChartPageData,
  StatusInforChartData,
  StockHomeData3,
} from '../../services/renderData';
import {InforStatusViewProps} from '../../services/typeProps';
import {BarChart} from 'react-native-gifted-charts/dist/BarChart';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const Chart = () => {
  useStatusBar('#1A1A1A');
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header />
        <InforView />
        <ChartView />
        <StockView />
      </ScrollView>
    </SafeAreaView>
  );
};

const StockView: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleNavigation = (stockIndex: number) => {
    navigation.navigate('ChartInfor', {itemIndex: stockIndex});
  };

  return (
    <View style={styles.stockViewContainer}>
      <Text style={styles.followHeaderTxT}>Cổ phiếu</Text>
      <View>
        {StockHomeData3.map((item, index) => {
          return (
            <TouchableOpacity
              style={styles.stock3Container}
              key={index}
              onPress={() => handleNavigation(index)}>
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
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const ChartView: React.FC = () => {
  return (
    <View style={centerAll}>
      <View style={{width: vw(90), overflow: 'hidden'}}>
        <BarChart
          isAnimated
          data={ChartPageData}
          barWidth={8}
          initialSpacing={10}
          spacing={20}
          barBorderRadius={4}
          showGradient
          yAxisThickness={0}
          xAxisType={'dashed'}
          xAxisColor={'#76787E'}
          yAxisTextStyle={{color: '#76787E'}}
          stepValue={1000}
          maxValue={6000}
          noOfSections={6}
          yAxisLabelTexts={[
            '$0k',
            '$10k',
            '$20k',
            '$30k',
            '$40k',
            '$50k',
            '$60k',
          ]}
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
        />
      </View>
    </View>
  );
};

const InforStatusView: React.FC<InforStatusViewProps> = ({
  amount,
  icon,
  label,
}) => {
  return (
    <View style={styles.inforStatusContainer}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={styles.amountText}>${amount}</Text>
      </View>
    </View>
  );
};

const InforView: React.FC = () => {
  return (
    <View style={styles.inforContainer}>
      <Text>Tổng danh mục đầu tư</Text>
      <View style={styles.inforAmountContainer}>
        <Text style={styles.inforAmounttxt1}>$13,240.11</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.inforAmounttxt2}>1.74% </Text>
          {increasingCircleIcon(vw(4), vw(4))}
        </View>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        {StatusInforChartData.map((item, index) => {
          return (
            <View key={index} style={{width: '47%'}}>
              <InforStatusView
                amount={item.amount}
                label={item.label}
                icon={item.icon}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const Header: React.FC = () => {
  return (
    <View style={[centerAll, styles.headerContainer]}>
      <Text style={styles.headertxt}>Danh mục đầu tư</Text>
    </View>
  );
};

export default Chart;

const styles = StyleSheet.create({
  container: container,
  headertxt: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerContainer: {
    paddingVertical: vh(2),
  },
  inforContainer: {
    paddingHorizontal: vw(5),
  },
  inforAmountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    columnGap: vw(2),
  },
  inforAmounttxt1: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inforAmounttxt2: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5DC172',
  },
  inforStatusContainer: {
    marginVertical: vh(2),
    borderWidth: 1,
    flexDirection: 'row',
    borderRadius: vw(2),
    borderColor: '#76787E',
    paddingVertical: vh(1),
    paddingHorizontal: vw(2),
    width: '100%',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: vw(20),
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
  },
  labelText: {
    color: '#76787E',
  },
  amountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stockTxt: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  stockViewContainer: {
    paddingHorizontal: vw(5),
    paddingVertical: vh(2),
  },
  followHeaderTxT: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
