import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {container, vh, vw} from '../../services/styleSheet';
import useStatusBar from '../../services/useStatusBar';
import PhoneInput from 'react-native-phone-input';
import CountryPicker from 'react-native-country-picker-modal';
import {backIcon} from '../../assets/svgXML';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const PhoneVerify = () => {
  useStatusBar('#1A1A1A');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const phoneRef = React.useRef<PhoneInput>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [countryCode, setCountryCode] = useState('VN');
  const [modalVisible, setModalVisible] = useState(false);

  const onSelect = (selectedCountry: any) => {
    setCountryCode(selectedCountry.cca2);
    if (phoneRef.current) {
      phoneRef.current.selectCountry(selectedCountry.cca2.toLowerCase());
    }
  };

  const onPressFlag = () => {
    setModalVisible(true);
  };

  const handlePress = () => {
    if (phoneRef.current && phoneRef.current.isValidNumber()) {
      navigation.navigate('OtpVerify');
    } else {
      Alert.alert('Số điện thoại không phù hợp', 'Hãy nhập lại số điện thoại');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.phoneContainer}>
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => navigation.goBack()}>
            {backIcon(vw(7), vw(7))}
          </TouchableOpacity>
          <View style={{rowGap: vh(1)}}>
            <Text style={styles.label}>Nhập số điện thoại</Text>
            <Text style={styles.desp}>
              Bạn sẽ nhận được mã gồm 4 chữ số để xác minh số điện thoại
            </Text>
          </View>
          <PhoneInput
            ref={phoneRef}
            onPressFlag={onPressFlag}
            initialCountry="vn"
            style={styles.phoneInput}
            textStyle={styles.inputTxt}
          />
          {modalVisible && (
            <CountryPicker
              withFlag
              withFilter
              withAlphaFilter
              withCallingCode
              onSelect={onSelect}
              onClose={() => setModalVisible(false)}
              visible={modalVisible}
              countryCode={'VN'}
            />
          )}
          <TouchableOpacity onPress={handlePress} style={styles.btnSendOTP}>
            <Text style={styles.btnOtptxt}>Gửi mã</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PhoneVerify;

const styles = StyleSheet.create({
  container: container,
  phoneInput: {
    flex: 1,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: vw(3),
    paddingVertical: vh(2),
  },
  inputTxt: {
    color: '#76787E',
  },
  phoneContainer: {
    paddingHorizontal: vw(5),
    flex: 1,
    paddingVertical: vh(2),
    rowGap: vh(2),
  },
  btnSendOTP: {
    backgroundColor: '#FFED4B',
    padding: vw(3),
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: vh(2),
  },
  btnOtptxt: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 14,
  },
  label: {
    color: '#76787E',
    fontSize: 20,
    fontWeight: '600',
  },
  desp: {
    color: '#666D80',
    fontSize: 14,
    fontWeight: '400',
  },
  btnBack: {
    padding: vw(2),
    borderWidth: 1,
    borderColor: '#76787E',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
});
