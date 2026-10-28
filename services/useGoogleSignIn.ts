import {Alert, Platform} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import {useSession} from './session';
import {useI18n} from './i18n';

// Google Sign-In on iOS needs an OAuth client ID (see README). Without one,
// configure() raises a red error screen in development, so skip it there.
const googleIosClientId: string | undefined = undefined;
const googleAvailable = Platform.OS === 'android' || !!googleIosClientId;
if (googleAvailable) {
  GoogleSignin.configure({iosClientId: googleIosClientId});
}

// After logging in, replace the auth screens so Back can't return to them.
export const enterApp = (
  navigation: NavigationProp<ParamListBase>,
  firstTime: boolean,
) =>
  navigation.reset({
    index: 0,
    routes: [{name: firstTime ? 'Welcome' : 'Main'}],
  });

export const useGoogleSignIn = () => {
  const navigation = useNavigation();
  const {t} = useI18n();
  const {logInWithGoogle} = useSession();

  return async () => {
    if (!googleAvailable) {
      Alert.alert(t('login.googleFailed'), t('login.googleUnavailable'));
      return;
    }
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const {firstTime} = await logInWithGoogle(response.data.user);
        enterApp(navigation, firstTime);
      }
      // Otherwise the user cancelled; nothing to do.
    } catch {
      Alert.alert(t('login.googleFailed'));
    }
  };
};
