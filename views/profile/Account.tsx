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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {container, vh, vw} from '../../services/styleSheet';
import {
  MIN_PASSWORD_LENGTH,
  SessionError,
  useSession,
} from '../../services/session';
import {useI18n} from '../../services/i18n';
import ScreenHeader from '../../components/ScreenHeader';

const Account = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {t} = useI18n();
  const {user, account, updateName, changePassword} = useSession();
  const [name, setName] = useState(user?.name ?? '');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const isGoogle = account?.provider === 'google';

  const saveName = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('account.nameRequired'));
      return;
    }
    await updateName(name);
    Alert.alert(t('common.success'), t('account.nameSaved'));
  };

  const savePassword = async () => {
    if (next.length < MIN_PASSWORD_LENGTH) {
      Alert.alert(t('common.error'), t('common.passwordTooShort'));
      return;
    }
    if (next !== confirm) {
      Alert.alert(t('common.error'), t('common.passwordMismatch'));
      return;
    }
    try {
      await changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      Alert.alert(t('common.success'), t('account.passwordChanged'));
    } catch (error) {
      if (error instanceof SessionError && error.code === 'WRONG_PASSWORD') {
        Alert.alert(t('common.error'), t('account.wrongPassword'));
      } else {
        throw error;
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('account.title')} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{t('account.name')}</Text>
        <TextInput
          testID="account-name"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#76787E"
        />
        <TouchableOpacity
          testID="account-save-name"
          style={styles.primaryBtn}
          onPress={saveName}>
          <Text style={styles.primaryText}>{t('account.saveName')}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>{t('common.email')}</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.label}>{t('account.phone')}</Text>
        <View style={styles.row}>
          <Text style={styles.value}>{account?.phone ?? '—'}</Text>
          <TouchableOpacity
            testID="account-phone"
            style={styles.smallBtn}
            onPress={() => navigation.navigate('PhoneVerify')}>
            <Text style={styles.smallBtnText}>
              {t(account?.phone ? 'account.changePhone' : 'account.addPhone')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('account.changePassword')}</Text>
        {isGoogle ? (
          <Text style={styles.value}>{t('account.googleAccount')}</Text>
        ) : (
          <>
            <TextInput
              testID="account-current-password"
              style={styles.input}
              value={current}
              onChangeText={setCurrent}
              placeholder={t('account.currentPassword')}
              placeholderTextColor="#76787E"
              secureTextEntry
            />
            <TextInput
              testID="account-new-password"
              style={styles.input}
              value={next}
              onChangeText={setNext}
              placeholder={t('reset.newPassword')}
              placeholderTextColor="#76787E"
              secureTextEntry
            />
            <TextInput
              testID="account-confirm-password"
              style={styles.input}
              value={confirm}
              onChangeText={setConfirm}
              placeholder={t('reset.confirmPassword')}
              placeholderTextColor="#76787E"
              secureTextEntry
            />
            <TouchableOpacity
              testID="account-save-password"
              style={[
                styles.primaryBtn,
                !(current && next && confirm) && styles.disabledBtn,
              ]}
              disabled={!(current && next && confirm)}
              onPress={savePassword}>
              <Text style={styles.primaryText}>{t('reset.submit')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: container,
  content: {
    paddingHorizontal: vw(5),
    paddingBottom: vh(4),
    rowGap: vh(1.5),
  },
  label: {
    color: '#76787E',
    fontSize: 13,
    marginTop: vh(1),
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
    flexShrink: 1,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: vh(2),
  },
  input: {
    borderWidth: 1,
    borderColor: '#76787E',
    borderRadius: 12,
    height: vw(13),
    color: '#FFFFFF',
    paddingHorizontal: vw(4),
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#FFED4B',
    borderRadius: 16,
    paddingVertical: vh(1.5),
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#CCCCCC',
  },
  primaryText: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  smallBtn: {
    paddingHorizontal: vw(3),
    paddingVertical: vh(0.8),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFED4B',
  },
  smallBtnText: {
    color: '#FFED4B',
    fontWeight: '600',
    fontSize: 13,
  },
});
