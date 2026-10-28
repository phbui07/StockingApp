import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import {translateNow} from './i18n';

const rnBiometrics = new ReactNativeBiometrics();

interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export type BiometryKind = 'faceId' | 'touchId' | 'fingerprint' | null;

class BiometricAuth {
  static async checkBiometricAvailability(): Promise<{
    available: boolean;
    biometryType?: BiometryKind;
  }> {
    try {
      const {available, biometryType} = await rnBiometrics.isSensorAvailable();
      const kinds: Record<string, BiometryKind> = {
        [BiometryTypes.FaceID]: 'faceId',
        [BiometryTypes.TouchID]: 'touchId',
        [BiometryTypes.Biometrics]: 'fingerprint',
      };
      return {
        available,
        biometryType: biometryType ? kinds[biometryType] ?? null : null,
      };
    } catch (error) {
      console.log('Biometric check error:', error);
      return {available: false};
    }
  }

  static async authenticateWithBiometrics(
    reason: string = translateNow('bio.defaultReason'),
  ): Promise<BiometricAuthResult> {
    try {
      const {available} = await this.checkBiometricAvailability();

      if (!available) {
        return {
          success: false,
          error: translateNow('bio.notAvailable'),
        };
      }

      const {success} = await rnBiometrics.simplePrompt({
        promptMessage: reason,
        cancelButtonText: translateNow('common.cancel'),
      });

      if (success) {
        return {success: true};
      } else {
        return {
          success: false,
          error: translateNow('bio.failed'),
        };
      }
    } catch (error) {
      console.log('Biometric auth error:', error);
      return {
        success: false,
        error: translateNow('bio.error'),
      };
    }
  }
}

export default BiometricAuth;
