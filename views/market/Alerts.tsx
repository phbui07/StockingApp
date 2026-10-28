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
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {container, vh, vw} from '../../services/styleSheet';
import {useQuotes} from '../../services/quoteStore';
import {useUserData} from '../../services/userData';
import {isValidTarget, PriceAlert} from '../../services/alerts';
import {requestNotificationPermission} from '../../services/notifications';
import {useI18n} from '../../services/i18n';
import {formatDateTime, formatMoney} from '../../services/format';
import ScreenHeader from '../../components/ScreenHeader';
import StockLogo from '../../components/StockLogo';

const Alerts = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const symbol = (route.params as {symbol?: string} | undefined)?.symbol;
  const {t} = useI18n();
  const {data, removeAlert, rearmAlert} = useUserData();
  const active = data.alerts.filter(alert => !alert.triggeredAt);
  const triggered = data.alerts.filter(alert => alert.triggeredAt);
  const {quotes} = useQuotes([
    ...data.alerts.map(alert => alert.symbol),
    ...(symbol ? [symbol] : []),
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('alerts.title')} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {symbol ? (
          <CreateAlertForm
            key={symbol}
            symbol={symbol}
            onDone={() => navigation.setParams({symbol: undefined})}
          />
        ) : (
          <TouchableOpacity
            testID="alerts-add"
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Search', {mode: 'alert'})}>
            <Text style={styles.primaryText}>{t('alerts.add')}</Text>
          </TouchableOpacity>
        )}

        {data.alerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('alerts.empty')}</Text>
            <Text style={styles.greyText}>{t('alerts.emptyDesc')}</Text>
          </View>
        ) : null}

        {active.length ? (
          <Text style={styles.sectionTitle}>
            {t('alerts.active', {count: active.length})}
          </Text>
        ) : null}
        {active.map(alert => (
          <AlertRow
            key={alert.id}
            alert={alert}
            price={quotes[alert.symbol]?.price}
            onDelete={() => removeAlert(alert.id)}
          />
        ))}

        {triggered.length ? (
          <Text style={styles.sectionTitle}>
            {t('alerts.triggered', {count: triggered.length})}
          </Text>
        ) : null}
        {triggered.map(alert => {
          const price = quotes[alert.symbol]?.price;
          return (
            <AlertRow
              key={alert.id}
              alert={alert}
              price={price}
              onDelete={() => removeAlert(alert.id)}
              onRearm={
                price !== undefined && price !== alert.target
                  ? () => rearmAlert(alert.id, price)
                  : undefined
              }
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const CreateAlertForm: React.FC<{symbol: string; onDone: () => void}> = ({
  symbol,
  onDone,
}) => {
  const {t} = useI18n();
  const {addAlert} = useUserData();
  const {quotes} = useQuotes([symbol]);
  const quote = quotes[symbol];
  const [targetText, setTargetText] = useState('');
  const target = Number(targetText.replace(',', '.'));
  const valid = !!quote && !!targetText && isValidTarget(target, quote.price);

  const create = async () => {
    if (!quote || !valid) {
      Alert.alert(t('common.error'), t('alerts.invalidTarget'));
      return;
    }
    addAlert(symbol, quote.name, target, quote.price);
    const allowed = await requestNotificationPermission();
    Alert.alert(
      t('alerts.created'),
      allowed ? undefined : t('alerts.permissionDenied'),
    );
    onDone();
  };

  return (
    <View testID="alert-form" style={styles.card}>
      <View style={styles.rowCenter}>
        <StockLogo symbol={symbol} />
        <View style={styles.flex}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.greyText}>
            {quote
              ? t('alerts.currentPrice', {price: formatMoney(quote.price)})
              : '—'}
          </Text>
        </View>
      </View>
      <TextInput
        testID="alert-target"
        style={styles.input}
        placeholder={t('alerts.targetPlaceholder')}
        placeholderTextColor="#76787E"
        value={targetText}
        onChangeText={setTargetText}
        keyboardType="decimal-pad"
      />
      {valid && quote ? (
        <Text style={styles.greyText}>
          {t(target > quote.price ? 'alerts.above' : 'alerts.below', {
            price: formatMoney(target),
          })}
        </Text>
      ) : null}
      <TouchableOpacity
        testID="alert-create"
        style={[styles.primaryBtn, !valid && styles.disabledBtn]}
        disabled={!valid}
        onPress={create}>
        <Text style={styles.primaryText}>{t('alerts.create')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const AlertRow: React.FC<{
  alert: PriceAlert;
  price?: number;
  onDelete: () => void;
  onRearm?: () => void;
}> = ({alert, price, onDelete, onRearm}) => {
  const {t, lang} = useI18n();
  return (
    <View testID={`alert-${alert.symbol}`} style={styles.card}>
      <View style={styles.rowCenter}>
        <StockLogo symbol={alert.symbol} size={36} />
        <View style={styles.flex}>
          <Text style={styles.symbol}>
            {alert.symbol} {alert.direction === 'above' ? '≥' : '≤'}{' '}
            {formatMoney(alert.target)}
          </Text>
          <Text style={styles.greyText}>
            {alert.triggeredAt
              ? t('alerts.triggeredAt', {
                  time: formatDateTime(alert.triggeredAt, lang),
                })
              : price !== undefined
              ? t('alerts.currentPrice', {price: formatMoney(price)})
              : alert.name}
          </Text>
        </View>
        {onRearm ? (
          <TouchableOpacity style={styles.smallBtn} onPress={onRearm}>
            <Text style={styles.smallBtnText}>{t('alerts.rearm')}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          testID={`alert-delete-${alert.symbol}`}
          style={styles.smallBtn}
          onPress={onDelete}>
          <Text style={[styles.smallBtnText, styles.deleteText]}>
            {t('common.delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Alerts;

const styles = StyleSheet.create({
  container: container,
  content: {
    paddingHorizontal: vw(5),
    paddingBottom: vh(4),
    rowGap: vh(1.5),
  },
  card: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    padding: vw(4),
    rowGap: vh(1.5),
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: vw(3),
  },
  symbol: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  greyText: {
    color: '#76787E',
    fontSize: 13,
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
  emptyCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    padding: vw(6),
    alignItems: 'center',
    rowGap: vh(1),
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: vh(1),
  },
  smallBtn: {
    paddingHorizontal: vw(2),
    paddingVertical: vh(0.8),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#76787E',
  },
  smallBtnText: {
    color: '#FFED4B',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteText: {
    color: '#FF4444',
  },
  flex: {
    flex: 1,
  },
});
