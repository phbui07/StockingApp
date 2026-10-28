/* eslint-disable react-native/no-inline-styles */
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {centerAll, container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileRenderView} from '../../services/renderData';
import {nextIcon, profileMoneyIcon} from '../../assets/svgXML';
import {useSession} from '../../services/session';
import {useUserData} from '../../services/userData';
import {useQuotes} from '../../services/quoteStore';
import {summarize} from '../../services/portfolio';
import {useI18n} from '../../services/i18n';
import {formatMoney} from '../../services/format';

type Nav = NativeStackNavigationProp<any>;

const Profile = () => {
  const navigation = useNavigation<Nav>();
  const {t} = useI18n();
  const {user, logOut} = useSession();
  const {data} = useUserData();
  const {quotes} = useQuotes(Object.keys(data.portfolio.positions));
  const total = summarize(data.portfolio, quotes).totalValue;
  const name = user?.name || user?.email || '';

  const openItem = (route: string) => {
    if (route === 'Transactions') {
      navigation.navigate('Main', {screen: 'Trade', params: {tab: 'history'}});
    } else {
      navigation.navigate(route);
    }
  };

  const confirmLogout = () =>
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      {text: t('common.cancel'), style: 'cancel'},
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          await logOut();
          navigation.reset({
            index: 1,
            routes: [{name: 'Onboarding'}, {name: 'Login'}],
          });
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom: vh(4)}}>
        <View style={[centerAll, styles.headerContainer]}>
          <Text style={styles.headertxt}>{t('profile.title')}</Text>
        </View>
        <View style={styles.container2}>
          <View style={styles.circle}>
            <Text style={styles.circleText}>
              {(name.charAt(0) || 'A').toUpperCase()}
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text testID="profile-name" style={styles.name}>
              {name}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.email}>{t('profile.virtualBalance')}</Text>
          <Text style={styles.balance}>{formatMoney(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.container3}
          onPress={() => Share.share({message: t('profile.inviteMessage')})}>
          <View style={styles.container4}>
            <View style={styles.circle1}>{profileMoneyIcon(vw(7), vw(7))}</View>
            <View style={styles.textContainer}>
              <Text style={styles.name}>{t('profile.invite')}</Text>
              <Text style={styles.email}>{t('profile.inviteDesc')}</Text>
            </View>
            {nextIcon(vw(8), vw(8), '#76787E')}
          </View>
        </TouchableOpacity>
        <View style={styles.container1}>
          {ProfileRenderView.map(item => (
            <TouchableOpacity
              key={item.route}
              testID={`profile-${item.route}`}
              style={styles.row}
              onPress={() => openItem(item.route)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  columnGap: vw(5),
                }}>
                <View style={styles.icon}>{item.icon}</View>
                <Text style={styles.label}>{t(item.label)}</Text>
              </View>
              <View style={styles.nextIcon}>{nextIcon(vw(8), vw(8))}</View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            testID="profile-logout"
            style={styles.logoutBtn}
            onPress={confirmLogout}>
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: container,
  headertxt: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerContainer: {
    paddingVertical: vh(2),
  },
  container1: {
    rowGap: vh(4),
    paddingHorizontal: vw(5),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  nextIcon: {
    width: 24,
    height: 24,
  },
  container2: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  circle: {
    width: vw(20),
    height: vw(20),
    borderRadius: vw(60),
    backgroundColor: '#FFED4B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  circleText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 12,
    color: '#76787E',
  },
  balanceCard: {
    marginHorizontal: vw(5),
    marginBottom: vh(2),
    padding: vw(4),
    borderRadius: 10,
    backgroundColor: '#2C2C2C',
  },
  balance: {
    color: '#FFED4B',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 4,
  },
  circle1: {
    width: vw(13),
    height: vw(13),
    borderRadius: vw(60),
    backgroundColor: '#FFED4B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  container3: {
    paddingHorizontal: vw(5),
    marginBottom: vh(3),
  },
  container4: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#76787E',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#2C2C2C',
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 16,
    paddingVertical: vh(1.5),
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF4444',
    fontWeight: '600',
  },
});
