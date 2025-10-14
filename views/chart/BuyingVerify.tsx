/* eslint-disable react-native/no-inline-styles */
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {centerAll, container, vh, vw} from '../../services/styleSheet';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  PayMethodData,
  StockHomeData3,
  VerifyData,
} from '../../services/renderData';
import {backIcon} from '../../assets/svgXML';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import ReactNativeBiometrics from 'react-native-biometrics';

const BuyingVerify = () => {
  const route = useRoute();
  const {dataIndex} = route.params as {dataIndex: number};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header />
        <View style={{paddingHorizontal: vw(5)}}>
          <BannerView itemIndex={dataIndex} />
        </View>
        <PayMethod />
      </ScrollView>
    </SafeAreaView>
  );
};

const PayMethod: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);

  const selectRadioButton = (index: number) => {
    setSelectedMethod(index);
  };

  const handleBuy = async () => {
    const rnBiometrics = new ReactNativeBiometrics();

    const {available} = await rnBiometrics.isSensorAvailable();

    if (!available) {
      Alert.alert(
        'Lỗi',
        'Xác thực sinh trắc học không khả dụng trên thiết bị này.',
      );
      return;
    }

    // Generate a key if it doesn't exist
    const {keysExist} = await rnBiometrics.biometricKeysExist();

    if (!keysExist) {
      const {publicKey} = await rnBiometrics.createKeys();
      console.log('Khóa công khai:', publicKey);
    }

    let epochTimeSeconds = Math.round(new Date().getTime() / 1000).toString();
    let payload = epochTimeSeconds + 'some message';

    rnBiometrics
      .createSignature({
        promptMessage: 'Xác minh danh tính của bạn',
        payload: payload,
      })
      .then(resultObject => {
        const {success, signature, error} = resultObject;

        if (success) {
          console.log(signature);
          Alert.alert(
            'Thành công',
            'Giao dịch thành công.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Main'), // Replace 'Main' with the actual name of your main screen
              },
            ],
            {cancelable: false},
          );
          // verifySignatureWithServer(signature, payload);
        } else {
          console.error('Lỗi tạo chữ ký:', error);
          Alert.alert('Lỗi', 'Không thể tạo chữ ký.');
        }
      })
      .catch(error => {
        console.error('Lỗi sinh trắc học:', error);
        Alert.alert('Lỗi', 'Xác thực sinh trắc học thất bại.');
      });
  };

  const isButtonDisabled = selectedMethod === null;

  return (
    <View style={{paddingHorizontal: vw(5), marginVertical: vh(2)}}>
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: '600',
          marginBottom: vh(2),
        }}>
        Phương thức thanh toán
      </Text>
      {PayMethodData.map((item, index) => {
        return (
          <View style={styles.cardContainer} key={index}>
            <View style={styles.cardContainer1}>
              <View style={styles.cardIcon}>{item.icon}</View>
              <View>
                <Text style={styles.whiteTxt}>{item.title}</Text>
                <Text style={styles.greyTxt}>{item.description}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => selectRadioButton(index)}>
              {selectedMethod === index && (
                <View style={styles.checkboxInner} />
              )}
            </TouchableOpacity>
          </View>
        );
      })}
      <TouchableOpacity
        onPress={handleBuy}
        style={[
          {
            backgroundColor: isButtonDisabled ? '#CCCCCC' : '#FFED4B',
            paddingHorizontal: vw(5),
            paddingVertical: vh(2),
            borderRadius: 16,
            marginTop: vh(2),
          },
          centerAll,
        ]}
        disabled={isButtonDisabled}>
        <Text style={{color: '#1A1A1A', fontSize: 14, fontWeight: '600'}}>
          Đặt lệnh
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const BannerView: React.FC<{itemIndex: number}> = ({itemIndex}) => {
  const data = VerifyData[itemIndex];
  return (
    <View
      style={{padding: vw(3), backgroundColor: '#2C2C2C', borderRadius: 10}}>
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
            <Text style={{color: '#1A1A1A', fontWeight: '600'}}>
              ${data.defaultPrice}
            </Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Nguồn tài trợ</Text>
            <Text style={[styles.infoValue, {color: '#FFED4B'}]}>
              {data.sponsor}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Ước tính giá cổ phiếu</Text>
            <Text style={styles.infoValue}>${data.stockPriceEstimate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Khoảng lượt chia sẻ</Text>
            <Text style={styles.infoValue}>{data.share}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Phí</Text>
            <Text style={styles.infoValue}>${data.fee}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Tổng</Text>
            <Text style={[styles.infoValue, {color: '#FFED4B'}]}>
              ${data.sum}
            </Text>
          </View>
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
      <Text style={styles.headerTxt}>Xác nhận lệnh</Text>
    </View>
  );
};

export default BuyingVerify;

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
  stockContent1: {
    flexDirection: 'row',
    columnGap: vw(2),
    alignItems: 'center',
  },
  infoContainer: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoKey: {
    color: 'white',
    fontSize: 14,
    width: '50%',
  },
  infoValue: {
    color: '#76787E',
    fontSize: 14,
    width: '50%',
    fontWeight: '600',
    textAlign: 'right',
  },
  cardContainer: {
    backgroundColor: '#2C2C2C',
    padding: vw(3),
    borderRadius: 10,
    marginBottom: vh(2),
    flexDirection: 'row',
    columnGap: vw(2),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContainer1: {
    flexDirection: 'row',
    columnGap: vw(2),
    alignItems: 'center',
  },
  cardIcon: {
    padding: vw(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFED4B',
    borderRadius: vw(20),
    alignSelf: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#76787E',
    borderRadius: vw(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: vw(12),
    backgroundColor: '#FFFFFF',
  },
});
