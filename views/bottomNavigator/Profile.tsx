/* eslint-disable react-native/no-inline-styles */
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {centerAll, container, vh, vw} from '../../services/styleSheet';
import {SafeAreaView} from 'react-native-safe-area-context';
import useStatusBar from '../../services/useStatusBar';
import {ProfileRenderView} from '../../services/renderData';
import {nextIcon, profileMoneyIcon} from '../../assets/svgXML';
import {UserProfile} from '../../services/typeProps';
import {loadData} from '../../services/storage';

const Profile = () => {
  useStatusBar('#1A1A1A');
  const [user, setUser] = useState<UserProfile>({
    givenName: '',
    familyName: '',
    email: '',
    name: '',
    photoUrl: null,
  });

  const fetchUserData = async () => {
    await loadData<UserProfile>('userLoginStorage')
      .then(data => {
        setUser(data);
      })
      .catch(() => {
        console.log('Error');
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header />
        <AccountRender data={user} />
        <Main />
      </ScrollView>
    </SafeAreaView>
  );
};

const AccountRender: React.FC<{data: UserProfile}> = ({data}) => {
  const firstLetter = data.email ? data.email.charAt(0).toUpperCase() : 'A';

  return (
    <View>
      <View style={styles.container2}>
        <View style={styles.circle}>
          <Text style={styles.circleText}>{firstLetter}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{data.name ?? 'New User'}</Text>
          <Text style={styles.email}>{data.email ?? 'newuser@gmail.com'}</Text>
        </View>
      </View>
      <View>
        <View style={styles.container3}>
          <View style={styles.container4}>
            <View style={styles.circle1}>{profileMoneyIcon(vw(7), vw(7))}</View>
            <View style={styles.textContainer}>
              <Text style={styles.name}>Mời bạn bè</Text>
              <Text style={styles.email}>
                Hãy mời thêm bạn bè để được đ100.000
              </Text>
            </View>
            {nextIcon(vw(8), vw(8), '#76787E')}
          </View>
        </View>
      </View>
    </View>
  );
};

const Main: React.FC = () => {
  return (
    <View style={styles.container1}>
      {ProfileRenderView.map((item, index) => {
        return (
          <View key={index} style={styles.row}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: vw(5),
              }}>
              <View style={styles.icon}>{item.icon}</View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
            <View style={styles.nextIcon}>{nextIcon(vw(8), vw(8))}</View>
          </View>
        );
      })}
    </View>
  );
};

const Header: React.FC = () => {
  return (
    <View style={[centerAll, styles.headerContainer]}>
      <Text style={styles.headertxt}>Tài khoản</Text>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(2),
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
});
