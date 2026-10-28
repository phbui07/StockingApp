/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {centerAll, container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import {stocklineIcon} from '../../assets/svgXML';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSession} from '../../services/session';
import {useUserData} from '../../services/userData';
import {useI18n} from '../../services/i18n';
import {formatMoney} from '../../services/format';

const Welcome = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {t} = useI18n();
  const {user} = useSession();
  const {data} = useUserData();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{flex: 1, paddingHorizontal: vw(5)}}>
        <View style={[centerAll, styles.centerStyle]}>
          <View style={{marginBottom: vh(4)}}>
            {stocklineIcon(vw(20), vw(20))}
          </View>
          <Text style={styles.label}>
            {t('welcome.hello', {
              name: user?.givenName || user?.name || t('welcome.friend'),
            })}{' '}
            <Image source={require('../../assets/init/wavingHand.png')} />
          </Text>
          <Text style={styles.label}>{t('welcome.title')}</Text>
          <Text style={styles.desp}>
            {t('welcome.subtitle', {
              amount: formatMoney(data.portfolio.startingCash),
            })}
          </Text>
        </View>
        <TouchableOpacity
          testID="welcome-start"
          onPress={() =>
            navigation.reset({index: 0, routes: [{name: 'Main'}]})
          }>
          <View style={[centerAll, styles.btn]}>
            <Text style={styles.btntxt}>{t('welcome.start')}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: container,
  centerStyle: {flex: 1, rowGap: vh(1.5)},
  btn: {
    paddingVertical: vh(2),
    backgroundColor: '#FFED4B',
    borderRadius: vw(2),
    marginBottom: vh(2),
  },
  btntxt: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  desp: {
    color: '#76787E',
    textAlign: 'center',
  },
});
