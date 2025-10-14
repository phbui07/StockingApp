/* eslint-disable react-native/no-inline-styles */
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import useStatusBar from '../../services/useStatusBar';
import {container, vh, vw} from '../../services/styleSheet';
import {backIcon} from '../../assets/svgXML';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const PasswordModifying = () => {
  useStatusBar('#1A1A1A');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [email, setEmail] = useState('');

  const handleVerify = async () => {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // Show an alert in Vietnamese if the email is invalid
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập địa chỉ email hợp lệ.');
    } else {
      try {
        // Call the Cloud Function to send the email
        Alert.alert(
          'Thành công',
          'Mã xác minh đã được gửi đến email của bạn.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
      } catch (error) {
        console.error(error);
        Alert.alert(
          'Lỗi',
          'Đã xảy ra lỗi khi gửi mã xác minh. Vui lòng thử lại.',
        );
      }
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
            <Text style={styles.label}>Đổi mật khẩu</Text>
            <Text style={styles.desp}>
              Vui lòng nhập email đã đăng ký của bạn, chúng tôi sẽ gửi cho bạn
              mã xác minh vào email
            </Text>
          </View>
          <View>
            <TextInput
              style={styles.otpInput}
              placeholder="Email"
              placeholderTextColor="#76787E"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.btnSendOTP,
              {backgroundColor: email ? '#FFED4B' : '#d3d3d3'},
            ]}
            onPress={handleVerify}
            disabled={!email}>
            <Text style={styles.btnOtptxt}>Gửi mã xác nhận</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PasswordModifying;

const styles = StyleSheet.create({
  container: container,
  phoneContainer: {
    paddingHorizontal: vw(5),
    flex: 1,
    paddingVertical: vh(2),
    rowGap: vh(2),
  },
  btnOtptxt: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 14,
  },
  label: {
    color: 'white',
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
  otpInput: {
    borderWidth: 1,
    borderColor: '#76787E',
    borderRadius: 12,
    width: '100%',
    height: vw(15),
    color: '#76787E',
    paddingHorizontal: vw(5),
  },
  btnSendOTP: {
    backgroundColor: '#FFED4B',
    padding: vw(3),
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: vh(2),
  },
});
