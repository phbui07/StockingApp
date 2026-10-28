import {
  Alert,
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
import {
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  SessionError,
  useSession,
} from '../../services/session';
import {useGoogleSignIn} from '../../services/useGoogleSignIn';
import {TKey, useI18n} from '../../services/i18n';
import InputField from '../../components/InputField';

const SignUp = () => {
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
          <Text style={styles.orText}>{t('signup.haveAccount')} </Text>
          <TouchableOpacity
            testID="signup-to-login"
            onPress={() => navigation.popTo('Login')}>
            <Text style={styles.loginText}>{t('signup.login')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const MainForm: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {t} = useI18n();
  const {signUp} = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [warning, setWarning] = useState<TKey | null>(null);
  const isFormValid = !!(name && email && password);

  const handleSubmit = async () => {
    const problem: TKey | null = !name.trim()
      ? 'signup.nameRequired'
      : !isValidEmail(email)
      ? 'common.invalidEmail'
      : password.length < MIN_PASSWORD_LENGTH
      ? 'common.passwordTooShort'
      : null;
    setWarning(problem);
    if (problem) {
      return;
    }
    try {
      await signUp(name, email, password);
    } catch (error) {
      if (error instanceof SessionError && error.code === 'EMAIL_EXISTS') {
        Alert.alert(t('common.error'), t('signup.emailExists'));
        return;
      }
      throw error;
    }
    Alert.alert(t('signup.success'), t('signup.successMessage'), [
      {text: t('common.ok'), onPress: () => navigation.popTo('Login')},
    ]);
  };

  return (
    <View style={styles.mainContainer}>
      <InputField
        testID="signup-name"
        placeholder={t('signup.name')}
        value={name}
        onChangeText={setName}
      />
      <InputField
        testID="signup-email"
        placeholder={t('common.email')}
        value={email}
        onChangeText={setEmail}
        email
      />
      <InputField
        testID="signup-password"
        placeholder={t('common.password')}
        value={password}
        onChangeText={setPassword}
        secure
      />
      {warning ? <Text style={styles.errorText}>{t(warning)}</Text> : null}
      <TouchableOpacity
        testID="signup-submit"
        style={[styles.btnMain, !isFormValid && styles.btnDisabled]}
        disabled={!isFormValid}
        onPress={handleSubmit}>
        <Text style={styles.btnMaintxt}>{t('common.continue')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const HeaderView: React.FC = () => {
  const {t} = useI18n();
  return (
    <View style={styles.header}>
      {stocklineIcon(vw(10), vw(10))}
      <Text style={styles.label}>{t('signup.title')}</Text>
      <Text style={styles.underLabel}>{t('signup.subtitle')}</Text>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: container,
  header: {
    rowGap: vh(2),
    paddingHorizontal: vw(5),
    paddingVertical: vh(4),
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
  errorText: {
    color: 'red',
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
});
