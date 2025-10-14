/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {StyleSheet, View} from 'react-native';
import {vh, vw} from './services/styleSheet';
import Home from './views/bottomNavigator/Home';
import {
  chartIcon,
  homeIcon,
  profileIcon,
  stockIcon,
  tradeIcon,
} from './assets/svgXML';
import Chart from './views/bottomNavigator/Chart';
import Trade from './views/bottomNavigator/Trade';
import Stock from './views/bottomNavigator/Stock';
import Profile from './views/bottomNavigator/Profile';
import Watchlist from './views/bottomNavigator/Watchlist';
import Onboarding from './views/init/Onboarding';
import SignUp from './views/account/SignUp';
import Login from './views/account/Login';
import PhoneVerify from './views/init/PhoneVerify';
import Welcome from './views/init/Welcome';
import ChartInfor from './views/chart/ChartInfor';
import BuyingVerify from './views/chart/BuyingVerify';
import OtpVerify from './views/init/OtpVerify';
import PasswordModifying from './views/init/PasswordModifying';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const TabNavigator = () => {
    return (
      <View style={styles.tabnavigationStyle}>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            tabBarActiveTintColor: '#FFED4B',
            tabBarShowLabel: false,
            tabBarStyle: {
              borderTopColor: '#1A1A1A',
              backgroundColor: '#1A1A1A',
              height: vh(9),
            },
          }}>
          <Tab.Screen
            name="Home"
            component={Home}
            options={{
              headerShown: false,
              tabBarIcon: ({color, focused}) => {
                const iconSize = focused ? vw(7) : vw(6);
                return (
                  <View style={[styles.iconContainer]}>
                    {homeIcon(iconSize, iconSize, color)}
                  </View>
                );
              },
            }}
          />
          <Tab.Screen
            name="Chart"
            component={Chart}
            options={{
              headerShown: false,
              tabBarIcon: ({color, focused}) => {
                const iconSize = focused ? vw(7) : vw(6);
                return (
                  <View style={[styles.iconContainer]}>
                    {chartIcon(iconSize, iconSize, color)}
                  </View>
                );
              },
            }}
          />
          <Tab.Screen
            name="Trade"
            component={Trade}
            options={{
              headerShown: false,
              tabBarIcon: ({focused}) => {
                const iconSize = focused ? vw(7) : vw(6);
                return (
                  <View style={[styles.iconContainer, styles.focusedIcon]}>
                    {tradeIcon(iconSize, iconSize, '#1A1A1A')}
                  </View>
                );
              },
            }}
          />
          <Tab.Screen
            name="Stock"
            component={Stock}
            options={{
              headerShown: false,
              tabBarIcon: ({color, focused}) => {
                const iconSize = focused ? vw(7) : vw(6);
                return (
                  <View style={[styles.iconContainer]}>
                    {stockIcon(iconSize, iconSize, color)}
                  </View>
                );
              },
            }}
          />
          <Tab.Screen
            name="Profile"
            component={Profile}
            options={{
              headerShown: false,
              tabBarIcon: ({color, focused}) => {
                const iconSize = focused ? vw(7) : vw(6);
                return (
                  <View style={[styles.iconContainer]}>
                    {profileIcon(iconSize, iconSize, color)}
                  </View>
                );
              },
            }}
          />
        </Tab.Navigator>
      </View>
    );
  };
  return (
    <NavigationContainer>
      {/* Main || Onboarding */}
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{headerShown: false}}
        />
        {/* Chart grp */}
        <Stack.Screen
          name="ChartInfor"
          component={ChartInfor}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="BuyingVerify"
          component={BuyingVerify}
          options={{headerShown: false}}
        />
        {/* End Chart grp */}
        {/* Init */}
        <Stack.Screen
          name="Onboarding"
          component={Onboarding}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="PasswordModifying"
          component={PasswordModifying}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PhoneVerify"
          component={PhoneVerify}
          options={{headerShown: false}}
        />
         <Stack.Screen
          name="OtpVerify"
          component={OtpVerify}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{headerShown: false}}
        />
        {/* Watchlist */}
        <Stack.Screen
          name="Watchlist"
          component={Watchlist}
          options={{headerShown: false}}
        />
        {/* End Init */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  tabnavigationStyle: {backgroundColor: '#1A1A1A', flex: 1},
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedIcon: {
    backgroundColor: '#FFED4B',
    borderRadius: vw(8), // Adjust the radius to make it a circle
    padding: vw(4), // Adjust the padding to control the size of the circle
  },
});
