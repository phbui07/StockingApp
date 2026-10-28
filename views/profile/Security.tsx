import {StyleSheet, Switch, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {container, vh, vw} from '../../services/styleSheet';
import BiometricAuth, {BiometryKind} from '../../services/biometricAuth';
import {useUserData} from '../../services/userData';
import {useI18n} from '../../services/i18n';
import ScreenHeader from '../../components/ScreenHeader';

const Security = () => {
  const {t} = useI18n();
  const {data, updateSettings} = useUserData();
  const [biometry, setBiometry] = useState<BiometryKind | undefined>();
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    BiometricAuth.checkBiometricAvailability().then(result => {
      setAvailable(result.available);
      setBiometry(result.biometryType);
    });
  }, []);

  const typeLabel = t(
    biometry === 'faceId'
      ? 'security.faceId'
      : biometry === 'touchId'
      ? 'security.touchId'
      : 'security.fingerprint',
  );

  const toggle = async (enabled: boolean) => {
    if (!enabled) {
      updateSettings({biometricForTrades: false});
      return;
    }
    // Prove the sensor works before relying on it for every order.
    const result = await BiometricAuth.authenticateWithBiometrics(
      t('security.enablePrompt'),
    );
    if (result.success) {
      updateSettings({biometricForTrades: true});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('security.title')} />
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{t('security.biometricTrades')}</Text>
            <Switch
              testID="security-biometric"
              value={data.settings.biometricForTrades && !!available}
              disabled={!available}
              onValueChange={toggle}
              trackColor={{true: '#FFED4B', false: '#76787E'}}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.desc}>
            {available === false
              ? t('security.notAvailable')
              : t('security.biometricDesc', {type: typeLabel})}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Security;

const styles = StyleSheet.create({
  container: container,
  content: {
    paddingHorizontal: vw(5),
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
    columnGap: vw(3),
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  desc: {
    color: '#76787E',
    fontSize: 13,
  },
});
