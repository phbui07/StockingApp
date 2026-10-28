/* eslint-disable react-native/no-inline-styles */
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {container, vh, vw} from '../../services/styleSheet';
import {backIcon} from '../../assets/svgXML';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import OTPTextInput from 'react-native-otp-textinput';
import {
  requestNotificationPermission,
  showNotification,
} from '../../services/notifications';
import {useSession} from '../../services/session';
import {useI18n} from '../../services/i18n';

export const OTP_LENGTH = 5;
const OTP_TTL_MS = 5 * 60 * 1000;

type Params = {purpose: 'reset' | 'phone'; email?: string; phone?: string};

const OtpVerify = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const {purpose, email, phone} = route.params as Params;
  const {t} = useI18n();
  const {setPhone} = useSession();
  const [otp, setOtp] = useState('');
  const issued = useRef<{code: string; expires: number} | null>(null);

  const sendCode = async () => {
    const code = String(Math.floor(10000 + Math.random() * 90000));
    issued.current = {code, expires: Date.now() + OTP_TTL_MS};
    if (await requestNotificationPermission()) {
      showNotification(
        t('otp.notificationTitle'),
        t('otp.notificationBody', {code}),
      );
    } else {
      // Without notifications there's no other channel on-device.
      Alert.alert(t('otp.fallbackTitle'), t('otp.fallbackBody', {code}));
    }
  };

  useEffect(() => {
    sendCode();
    // Send once when the screen opens; "Resend" handles the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async () => {
    const current = issued.current;
    if (!current || Date.now() > current.expires) {
      Alert.alert(t('otp.invalidTitle'), t('otp.expired'));
      return;
    }
    if (otp !== current.code) {
      Alert.alert(t('otp.invalidTitle'), t('otp.invalid'));
      return;
    }
    issued.current = null;
    if (purpose === 'reset') {
      navigation.replace('PasswordModifying', {step: 'reset', email});
    } else {
      await setPhone(phone!);
      Alert.alert(t('common.success'), t('phone.verified'), [
        {text: t('common.ok'), onPress: () => navigation.popTo('Account')},
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.phoneContainer}>
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => navigation.goBack()}>
            {backIcon(vw(7), vw(7))}
          </TouchableOpacity>
          <View style={{rowGap: vh(1)}}>
            <Text style={styles.label}>{t('otp.title')}</Text>
            <Text style={styles.desp}>{t('otp.desc')}</Text>
          </View>
          <View>
            <OTPTextInput
              handleTextChange={setOtp}
              inputCount={OTP_LENGTH}
              containerStyle={styles.otpContainer}
              textInputStyle={styles.otpInput}
              tintColor="#FFED4B"
              offTintColor="#FFED4B"
            />
          </View>
          <TouchableOpacity testID="otp-resend" onPress={sendCode}>
            <Text style={{color: '#FFED4B', fontWeight: '600'}}>
              {t('otp.resend')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="otp-verify"
            style={[
              styles.btnSendOTP,
              otp.length < OTP_LENGTH && {backgroundColor: '#d3d3d3'},
            ]}
            disabled={otp.length < OTP_LENGTH}
            onPress={handleVerify}>
            <Text style={styles.btnOtptxt}>{t('otp.verify')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OtpVerify;

const styles = StyleSheet.create({
  container: container,
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
  otpContainer: {
    marginTop: vh(2),
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#FFED4B',
    borderRadius: 12,
    width: vw(15),
    height: vw(15),
    textAlign: 'center',
    color: '#FFED4B',
  },
});
