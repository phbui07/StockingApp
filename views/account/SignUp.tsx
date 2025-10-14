/* eslint-disable react-hooks/exhaustive-deps */
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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
  SignUpInputFieldProps,
} from '../../services/typeProps';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Accounts} from '../../services/renderData';
import {loadData, saveData} from '../../services/storage';

const SignUp = () => {
  useStatusBar('#1A1A1A');
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <HeaderView />
        <MainForm />
        <FooterView />
      </ScrollView>
    </SafeAreaView>
  );
};

const FooterView: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.lineContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Hoặc có thể tiếp tục</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
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
            <Text style={styles.loginText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const MainForm: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [inputData, setInputData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);
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
    const {username, email, password} = inputData;
    const isFormFilled = !!(username && email && password);
    setIsFormValid(isFormFilled);
  };

  const checkEmailValidation = () => {
    const {email} = inputData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(email);
    setEmailWarning(emailValid ? '' : 'Email không hợp lệ');
    return emailValid;
  };

  const handleSubmit = async () => {
    const isEmailValid = checkEmailValidation();
    if (!isEmailValid) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    } else {
      const emailExists = accounts.find(
        account => account.email === inputData.email,
      );
      if (emailExists) {
        Alert.alert('Lỗi', 'Email đã tồn tại');
        return;
      }

      // Proceed with form submission
      const newAccount = {
        name: inputData.username,
        email: inputData.email,
        pass: inputData.password,
      };

      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      // Save the new account to the database
      await saveData('accountsStorage', updatedAccounts);
      Alert.alert('Đăng ký thành công', 'Chuyển đến trang đăng nhập', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to the login screen
            navigation.navigate('Login');
          },
        },
      ]);
    }
  };

  useEffect(() => {
    checkIfAllFieldsFilled();
  }, [inputData]);

  return (
    <View style={styles.mainContainer}>
      <InputField
        placeholder="Tên đăng nhập"
        value={inputData.username}
        onChangeText={handleInputChange('username')}
      />
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

const HeaderView: React.FC = () => {
  return (
    <View style={styles.header}>
      {stocklineIcon(vw(10), vw(10))}
      <Text style={styles.label}>Join Stockline</Text>
      <Text style={styles.underLabel}>
        Bắt tay vào hành trình đầu tư của bạn chỉ với đ20.000
      </Text>
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
    marginBottom: 10,
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
});
