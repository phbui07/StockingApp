import {Dimensions, TextStyle} from 'react-native';
export const vw = (number: number) =>
  Dimensions.get('window').width * (number / 100);
export const vh = (number: number) =>
  Dimensions.get('window').height * (number / 100);
export const vmin = (number: number) =>
  Math.min(
    Dimensions.get('window').width * (number / 100),
    Dimensions.get('window').height * (number / 100),
  );
export const vmax = (number: number) =>
  Math.max(
    Dimensions.get('window').width * (number / 100),
    Dimensions.get('window').height * (number / 100),
  );

export const centerAll: TextStyle = {
  justifyContent: 'center',
  alignItems: 'center',
};

export const container: TextStyle = {
  flex: 1,
  backgroundColor: '#1A1A1A',
};
