import {PermissionsAndroid, Platform} from 'react-native';
import {Notifications} from 'react-native-notifications';

// Local notifications for verification codes and price alerts.

const needsAndroidPermission = () =>
  Platform.OS === 'android' && Number(Platform.Version) >= 33;

export const hasNotificationPermission = async () => {
  if (needsAndroidPermission()) {
    return PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
  if (Platform.OS === 'ios') {
    const permissions = await Notifications.ios.checkPermissions();
    return !!permissions.alert;
  }
  return true;
};

export const requestNotificationPermission = async () => {
  if (await hasNotificationPermission()) {
    return true;
  }
  if (needsAndroidPermission()) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  if (Platform.OS !== 'ios') {
    return true;
  }
  // iOS only reports a denial, so watch the permission until it flips or the
  // prompt is dismissed.
  return new Promise<boolean>(resolve => {
    let settled = false;
    const finish = (granted: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      denied.remove();
      clearInterval(poll);
      clearTimeout(timeout);
      resolve(granted);
    };
    const denied =
      Notifications.events().registerRemoteNotificationsRegistrationDenied(() =>
        finish(false),
      );
    const poll = setInterval(async () => {
      if (await hasNotificationPermission()) {
        finish(true);
      }
    }, 500);
    const timeout = setTimeout(() => finish(false), 60000);
    Notifications.registerRemoteNotifications();
  });
};

let nextId = 1;

export const showNotification = (title: string, body: string) => {
  const id = nextId++;
  Notifications.postLocalNotification(
    {
      title,
      body,
      sound: 'default',
      identifier: String(id),
      payload: {},
      badge: 0,
      type: '',
      thread: '',
    },
    id,
  );
};
