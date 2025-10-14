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
import {UserProfile} from '../../services/typeProps';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type WelcomeRouteProp = RouteProp<
  {Welcome: {userData: UserProfile}},
  'Welcome'
>;

const Welcome = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<WelcomeRouteProp>();
  const user = route.params.userData;

  const handleStart = () => () => {
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{flex: 1, paddingHorizontal: vw(5)}}>
        <View style={[centerAll, styles.centerStyle]}>
          <View style={{marginBottom: vh(4)}}>
            {stocklineIcon(vw(20), vw(20))}
          </View>
          <Text style={styles.label}>
            Xin chào {user.givenName ?? 'New User'}!{' '}
            <Image source={require('../../assets/init/wavingHand.png')} />
          </Text>
          <Text style={styles.label}>Chào mừng tới Stockline</Text>
          <Text style={styles.desp}>Thật tuyệt khi có bạn ở đây</Text>
        </View>
        <TouchableOpacity onPress={handleStart()}>
          <View style={[centerAll, styles.btn]}>
            <Text style={styles.btntxt}>Bắt đầu</Text>
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
  },
  desp: {
    color: '#76787E',
  },
});
