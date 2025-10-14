import {Alert} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

class BiometricAuth {
  static async checkBiometricAvailability(): Promise<{
    available: boolean;
    biometryType?: string;
  }> {
    try {
      const {available, biometryType} = await rnBiometrics.isSensorAvailable();
      return {available, biometryType};
    } catch (error) {
      console.log('Biometric check error:', error);
      return {available: false};
    }
  }

  static async authenticateWithBiometrics(
    reason: string = 'Xác thực để tiếp tục',
  ): Promise<BiometricAuthResult> {
    try {
      const {available} = await this.checkBiometricAvailability();

      if (!available) {
        return {
          success: false,
          error: 'Thiết bị không hỗ trợ xác thực sinh trắc học',
        };
      }

      const {success} = await rnBiometrics.simplePrompt({
        promptMessage: reason,
        cancelButtonText: 'Hủy',
      });

      if (success) {
        return {success: true};
      } else {
        return {
          success: false,
          error: 'Xác thực không thành công',
        };
      }
    } catch (error) {
      console.log('Biometric auth error:', error);
      return {
        success: false,
        error: 'Lỗi xác thực sinh trắc học',
      };
    }
  }

  static async authenticateForTransaction(
    amount: number,
    symbol: string,
  ): Promise<BiometricAuthResult> {
    const reason = `Xác thực để giao dịch ${symbol} với giá trị $${amount.toFixed(2)}`;
    return await this.authenticateWithBiometrics(reason);
  }

  static showBiometricSetupAlert() {
    Alert.alert(
      'Thiết lập xác thực',
      'Vui lòng thiết lập vân tay hoặc Face ID trong Cài đặt để sử dụng tính năng này.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Mở Cài đặt',
          onPress: () => {
            // In a real app, you would open settings
            console.log('Open device settings');
          },
        },
      ],
    );
  }
}

export default BiometricAuth;