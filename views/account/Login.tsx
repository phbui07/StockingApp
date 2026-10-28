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
import {centerAll, container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import {goggleIcon, stocklineIcon} from '../../assets/svgXML';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {isValidEmail, useSession} from '../../services/session';
import {enterApp, useGoogleSignIn} from '../../services/useGoogleSignIn';
import {useI18n} from '../../services/i18n';
import InputField from '../../components/InputField';

const Login = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <HeaderView />
        <MainForm />
        <FooterView />
      </ScrollView>
    </SafeAreaView>
  );
};

const MainForm: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {t} = useI18n();
  const {logIn} = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const isFormValid = !!(email && password);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setEmailWarning(t('common.invalidEmail'));
      return;
    }
    setEmailWarning('');
    try {
      const {firstTime} = await logIn(email, password);
      enterApp(navigation, firstTime);
    } catch {
      Alert.alert(t('login.wrongCredentials'));
    }
  };

  return (
    <View style={styles.mainContainer}>
      <InputField
        testID="login-email"
        placeholder={t('common.email')}
        value={email}
        onChangeText={setEmail}
        email
      />
      {emailWarning ? (
        <Text style={styles.errorText}>{emailWarning}</Text>
      ) : null}
      <InputField
        testID="login-password"
        placeholder={t('common.password')}
        value={password}
        onChangeText={setPassword}
        secure
      />
      <TouchableOpacity
        testID="login-submit"
        style={[styles.btnMain, !isFormValid && styles.btnDisabled]}
        disabled={!isFormValid}
        onPress={handleSubmit}>
        <Text style={styles.btnMaintxt}>{t('common.continue')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="login-forgot"
        onPress={() => navigation.navigate('PasswordModifying')}
        style={{alignSelf: 'flex-end'}}>
        <Text style={{color: '#FFED4B', fontWeight: '600'}}>
          {t('login.forgot')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const FooterView: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {t} = useI18n();
  const signInWithGoogle = useGoogleSignIn();

  return (
    <View style={styles.footerContainer}>
      <View style={styles.lineContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>{t('common.orContinueWith')}</Text>
        <View style={styles.line} />
      </View>
      <TouchableOpacity style={styles.button} onPress={signInWithGoogle}>
        <View style={styles.txtIconGrp}>
          {goggleIcon(vw(5), vw(5))}
          <Text style={styles.buttonText}>Google</Text>
        </View>
      </TouchableOpacity>
      <View style={centerAll}>
        <View style={styles.loginContainer}>
          <Text style={styles.orText}>{t('login.noAccount')} </Text>
          <TouchableOpacity
            testID="login-to-signup"
            onPress={() => navigation.popTo('SignUp')}>
            <Text style={styles.loginText}>{t('login.signUp')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const HeaderView: React.FC = () => {
  const {t} = useI18n();
  return (
    <View style={styles.header}>
      {stocklineIcon(vw(10), vw(10))}
      <Text style={styles.label}>
        {t('login.title')}{' '}
        <Image source={require('../../assets/init/wavingHand.png')} />
      </Text>
      <Text style={styles.underLabel}>{t('login.subtitle')}</Text>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: container,
  header: {
    rowGap: vh(2),
    paddingHorizontal: vw(5),
    paddingVertical: vh(4),
  },
  underLabel: {
    color: '#76787E',
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerContainer: {
    paddingHorizontal: vw(5),
    alignItems: 'center',
    marginTop: vh(5),
    rowGap: vh(2),
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#76787E',
  },
  orText: {
    marginHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#76787E',
    backgroundColor: 'transparent',
    borderRadius: 6,
  },
  buttonText: {
    color: '#76787E',
    fontWeight: '500',
  },
  txtIconGrp: {flexDirection: 'row', alignItems: 'center', columnGap: vw(2)},
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    color: '#FFED4B',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  mainContainer: {
    marginTop: vh(2),
    paddingHorizontal: vw(5),
    rowGap: vh(1.5),
  },
  btnMain: {
    backgroundColor: '#FFED4B',
    padding: vw(3),
    borderRadius: 16,
    alignItems: 'center',
  },
  btnMaintxt: {
    color: 'black',
    fontWeight: '600',
  },
  btnDisabled: {
    backgroundColor: '#D3D3D3',
  },
});
