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
import {container, vh, vw} from '../../services/styleSheet';
import {backIcon} from '../../assets/svgXML';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  useSession,
} from '../../services/session';
import {useI18n} from '../../services/i18n';

// Forgot-password flow: step "email" asks for the account, OtpVerify checks
// a code sent to this device, then step "reset" sets the new password.
type Params = {step?: 'email' | 'reset'; email?: string} | undefined;

const PasswordModifying = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const {step = 'email', email: verifiedEmail} = (route.params as Params) ?? {};
  const {t} = useI18n();
  const {findAccount, resetPassword} = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const sendCode = () => {
    if (!isValidEmail(email)) {
      Alert.alert(t('common.invalidEmail'));
      return;
    }
    const account = findAccount(email);
    if (!account) {
      Alert.alert(t('common.error'), t('forgot.notFound'));
      return;
    }
    if (account.provider === 'google') {
      Alert.alert(t('common.error'), t('forgot.googleAccount'));
      return;
    }
    navigation.navigate('OtpVerify', {
      purpose: 'reset',
      email: normalizeEmail(email),
    });
  };

  const savePassword = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert(t('common.error'), t('common.passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      Alert.alert(t('common.error'), t('common.passwordMismatch'));
      return;
    }
    await resetPassword(verifiedEmail!, password);
    Alert.alert(t('common.success'), t('reset.success'), [
      {text: t('common.ok'), onPress: () => navigation.popTo('Login')},
    ]);
  };

  const isReset = step === 'reset' && !!verifiedEmail;
  const ready = isReset ? !!(password && confirm) : !!email;

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
            <Text style={styles.label}>
              {t(isReset ? 'reset.title' : 'forgot.title')}
            </Text>
            <Text style={styles.desp}>
              {isReset
                ? t('reset.desc', {email: verifiedEmail})
                : t('forgot.desc')}
            </Text>
          </View>
          {isReset ? (
            <>
              <TextInput
                testID="reset-password"
                style={styles.otpInput}
                placeholder={t('reset.newPassword')}
                placeholderTextColor="#76787E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                testID="reset-confirm"
                style={styles.otpInput}
                placeholder={t('reset.confirmPassword')}
                placeholderTextColor="#76787E"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />
            </>
          ) : (
            <TextInput
              testID="forgot-email"
              style={styles.otpInput}
              placeholder={t('common.email')}
              placeholderTextColor="#76787E"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          )}
          <TouchableOpacity
            testID="forgot-submit"
            style={[
              styles.btnSendOTP,
              {backgroundColor: ready ? '#FFED4B' : '#d3d3d3'},
            ]}
            onPress={isReset ? savePassword : sendCode}
            disabled={!ready}>
            <Text style={styles.btnOtptxt}>
              {t(isReset ? 'reset.submit' : 'forgot.send')}
            </Text>
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
    color: '#FFFFFF',
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
