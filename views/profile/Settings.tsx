import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {container, vh, vw} from '../../services/styleSheet';
import {useUserData} from '../../services/userData';
import {STARTING_CASH_OPTIONS} from '../../services/portfolio';
import {
  hasNotificationPermission,
  requestNotificationPermission,
} from '../../services/notifications';
import {useI18n} from '../../services/i18n';
import {formatMoney} from '../../services/format';
import {getApiKey, removeApiKey} from '../../services/aiExplainer';
import ScreenHeader from '../../components/ScreenHeader';
import ApiKeyForm from '../../components/ApiKeyForm';

const Settings = () => {
  const {t} = useI18n();
  const {data, updateSettings, resetPortfolio} = useUserData();
  const [notificationsOn, setNotificationsOn] = useState<boolean | null>(null);
  const [hasAiKey, setHasAiKey] = useState(false);
  const startingCash = data.settings.startingCash;

  useEffect(() => {
    hasNotificationPermission().then(setNotificationsOn);
    getApiKey().then(key => setHasAiKey(!!key));
  }, []);

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsOn(granted);
    if (!granted) {
      Alert.alert(t('settings.notifications'), t('alerts.permissionDenied'));
    }
  };

  const confirmReset = () =>
    Alert.alert(t('settings.reset'), t('settings.resetConfirm'), [
      {text: t('common.cancel'), style: 'cancel'},
      {
        text: t('settings.reset'),
        style: 'destructive',
        onPress: () => {
          resetPortfolio();
          Alert.alert(t('common.success'), t('settings.resetDone'));
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('settings.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{t('settings.notifications')}</Text>
            {notificationsOn ? (
              <Text style={styles.onText}>{t('settings.notificationsOn')}</Text>
            ) : (
              <TouchableOpacity
                testID="settings-notifications"
                style={styles.smallBtn}
                onPress={enableNotifications}>
                <Text style={styles.smallBtnText}>
                  {t('settings.enableNotifications')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.desc}>{t('settings.notificationsDesc')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('settings.virtualAccount')}</Text>
          <Text style={styles.desc}>{t('settings.startingBalance')}</Text>
          <View style={styles.options}>
            {STARTING_CASH_OPTIONS.map(amount => (
              <TouchableOpacity
                key={amount}
                testID={`settings-cash-${amount}`}
                style={[
                  styles.option,
                  amount === startingCash && styles.optionActive,
                ]}
                onPress={() => updateSettings({startingCash: amount})}>
                <Text
                  style={[
                    styles.optionText,
                    amount === startingCash && styles.optionTextActive,
                  ]}>
                  {formatMoney(amount).replace('.00', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.desc}>
            {t('settings.resetDesc', {amount: formatMoney(startingCash)})}
          </Text>
          <TouchableOpacity
            testID="settings-reset"
            style={styles.dangerBtn}
            onPress={confirmReset}>
            <Text style={styles.dangerText}>{t('settings.reset')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{t('settings.ai')}</Text>
            {hasAiKey ? (
              <Text style={styles.onText}>{t('settings.aiKeySet')}</Text>
            ) : null}
          </View>
          <Text style={styles.desc}>{t('settings.aiDesc')}</Text>
          {hasAiKey ? (
            <TouchableOpacity
              testID="settings-ai-remove"
              style={styles.smallBtn}
              onPress={async () => {
                await removeApiKey();
                setHasAiKey(false);
              }}>
              <Text style={styles.smallBtnText}>
                {t('settings.aiRemoveKey')}
              </Text>
            </TouchableOpacity>
          ) : (
            <ApiKeyForm
              onSaved={() => {
                setHasAiKey(true);
                Alert.alert(t('common.success'), t('settings.aiKeySaved'));
              }}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('settings.dataSource')}</Text>
          <Text style={styles.desc}>{t('settings.dataSourceDesc')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: container,
  content: {
    paddingHorizontal: vw(5),
    paddingBottom: vh(4),
    rowGap: vh(2),
  },
  card: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    padding: vw(4),
    rowGap: vh(1),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  desc: {
    color: '#76787E',
    fontSize: 13,
  },
  onText: {
    color: '#5DC172',
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
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: vw(2),
  },
  option: {
    paddingHorizontal: vw(3),
    paddingVertical: vh(1),
    borderRadius: vw(5),
    backgroundColor: '#1A1A1A',
  },
  optionActive: {
    backgroundColor: '#FFED4B',
  },
  optionText: {
    color: '#76787E',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#1A1A1A',
  },
  dangerBtn: {
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 16,
    paddingVertical: vh(1.5),
    alignItems: 'center',
    marginTop: vh(1),
  },
  dangerText: {
    color: '#FF4444',
    fontWeight: '600',
  },
});
