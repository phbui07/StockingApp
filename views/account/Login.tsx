/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {centerAll, container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import useStatusBar from '../../services/useStatusBar';
import {
  appleIcon,
  goggleIcon,
  passwordHiddenIcon,
  stocklineIcon,
} from '../../assets/svgXML';
import {
  AccountInterface,
  LoginISFirstTimeProps,
  SignUpInputFieldProps,
  UserProfile,
} from '../../services/typeProps';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import {loadData, saveData} from '../../services/storage';
import {Accounts} from '../../services/renderData';

const Login = () => {
  useStatusBar('#1A1A1A');
  const [firstTime, setFirstTime] = useState<Array<string>>([]);

  const fetchIsFirstTime = async () => {
    loadData<string[]>('isFirstTime')
      .then(data => {
        setFirstTime(data || []);
      })
      .catch(() => {
        setFirstTime(['123@gmail.com']);
      });
  };

  useFocusEffect(
    useCallback(() => {
      fetchIsFirstTime();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <HeaderView />
        <MainForm isFirst={firstTime} setIsFirst={setFirstTime} />
        <FooterView isFirst={firstTime} setIsFirst={setFirstTime} />
      </ScrollView>
    </SafeAreaView>
  );
};

const MainForm: React.FC<LoginISFirstTimeProps> = ({isFirst, setIsFirst}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [inputData, setInputData] = useState({
    email: '',
    password: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailWarning, setEmailWarning] = useState('');
  const [accounts, setAccounts] = useState<AccountInterface[]>(Accounts);

  const fetchAccounts = async () => {
    // Fetch accounts from the database
    await loadData<AccountInterface[]>('accountsStorage')
      .then(data => {
        if (data) {
          setAccounts(data);
        }
      })
      .catch(() => {
        setAccounts(Accounts);
      });
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleInputChange = (field: string) => (text: string) => {
    setInputData(prevData => ({
      ...prevData,
      [field]: text,
    }));
    checkIfAllFieldsFilled();
  };

  const checkIfAllFieldsFilled = () => {
    const {email, password} = inputData;
    const isFormFilled = !!(email && password);
    setIsFormValid(isFormFilled);
  };

  const checkEmailValidation = () => {
    const {email} = inputData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(email);
    setIsEmailValid(emailValid);
    setEmailWarning(emailValid ? '' : 'Email không hợp lệ');
    return emailValid;
  };

  const handleSubmit = async () => {
    checkEmailValidation();
    if (!isEmailValid) {
      return;
    }
    // Proceed with form submission
    const account = accounts.find(
      acc => acc.email === inputData.email && acc.pass === inputData.password,
    );
    console.log('account', accounts);

    if (account) {
      const user: UserProfile = {
        email: account.email,
        familyName: account.name,
        givenName: account.name,
        name: account.name,
        photoUrl: '',
      };
      saveData('userLoginStorage', user);

      if (!isFirst.find(item => item === `${account.email},${account.name}`)) {
        setIsFirst([
          ...isFirst.map(String),
          `${account.email},${account.name}`,
        ]);
        saveData('isFirstTime', [
          ...isFirst,
          `${account.email},${account.name}`,
        ]);
        navigation.navigate('Welcome', {
          userData: user,
        });
      } else {
        navigation.navigate('Main');
      }
    } else {
      Alert.alert('Email hoặc mật khẩu không đúng');
    }
  };

  useEffect(() => {
    checkIfAllFieldsFilled();
  }, [inputData]);

  return (
    <View style={styles.mainContainer}>
      <InputField
        placeholder="Email"
        value={inputData.email}
        onChangeText={handleInputChange('email')}
      />
      {emailWarning ? (
        <Text style={styles.errorText}>{emailWarning}</Text>
      ) : null}
      <InputField
        placeholder="Mật khẩu"
        value={inputData.password}
        onChangeText={handleInputChange('password')}
      />
      <TouchableOpacity
        style={[styles.btnMain, !isFormValid && styles.btnDisabled]}
        disabled={!isFormValid}
        onPress={handleSubmit}>
        <Text style={styles.btnMaintxt}>Tiếp tục</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('PhoneVerify');
        }}
        style={{alignSelf: 'flex-end'}}>
        <Text style={{color: '#FFED4B', fontWeight: '600'}}>
          Quên mật khẩu?
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const InputField: React.FC<SignUpInputFieldProps> = ({
  onChangeText,
  placeholder,
  value,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={'#76787E'}
        style={styles.inputField}
        secureTextEntry={placeholder === 'Mật khẩu' && !isPasswordVisible}
      />
      {placeholder === 'Mật khẩu' && (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.iconButton}>
          {passwordHiddenIcon(vw(6), vw(6))}
        </TouchableOpacity>
      )}
    </View>
  );
};

const FooterView: React.FC<LoginISFirstTimeProps> = ({isFirst, setIsFirst}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const handleLoginPress = () => {
    navigation.navigate('SignUp');
  };

  GoogleSignin.configure();

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const user = {
          email: response.data.user.email,
          familyName: response.data.user.familyName,
          givenName: response.data.user.givenName,
          name: response.data.user.name,
          photoUrl: response.data.user.photo,
        };
        await saveData('userLoginStorage', user);

        if (
          !isFirst.find(
            item =>
              item === `${response.data.user.email},${response.data.user.name}`,
          )
        ) {
          setIsFirst([
            ...isFirst.map(String),
            `${response.data.user.email},${response.data.user.name}`,
          ]);
          saveData('isFirstTime', [
            ...isFirst,
            `${response.data.user.email},${response.data.user.name}`,
          ]);
          navigation.navigate('Welcome', {
            userData: user,
          });
        } else {
          navigation.navigate('Main');
        }
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      Alert.alert('Logged in failed');
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      // setState({user: null});
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.lineContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Hoặc có thể tiếp tục</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            signIn();
            // signOut();
          }}>
          <View style={styles.txtIconGrp}>
            {goggleIcon(vw(5), vw(5))}
            <Text style={styles.buttonText}>Google</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <View style={styles.txtIconGrp}>
            {appleIcon(vw(5), vw(5))}
            <Text style={styles.buttonText}>Apple</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={centerAll}>
        <View style={styles.loginContainer}>
          <Text style={styles.orText}>Bạn đã có tài khoản? </Text>
          <TouchableOpacity onPress={handleLoginPress}>
            <Text style={styles.loginText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const HeaderView: React.FC = () => {
  return (
    <View style={styles.header}>
      {stocklineIcon(vw(10), vw(10))}
      <Text style={styles.label}>
        Xin chào <Image source={require('../../assets/init/wavingHand.png')} />
      </Text>
      <Text style={styles.underLabel}>
        Chào mừng đã quay trở lại, hãy đăng nhập:
      </Text>
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
  buttonContainer: {
    width: '100%',
    rowGap: vh(1),
  },
  button: {
    flex: 1,
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
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 16,
    paddingHorizontal: vw(3),
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'absolute',
    right: vw(3),
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
