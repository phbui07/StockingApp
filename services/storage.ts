import AsyncStorage from '@react-native-async-storage/async-storage';

// Values written by the old react-native-storage wrapper look like
// {rawData, expires}; unwrap them so existing accounts keep working.
const unwrap = (value: any) =>
  value && typeof value === 'object' && 'rawData' in value
    ? value.rawData
    : value;

export const readJSON = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) {
      return fallback;
    }
    return unwrap(JSON.parse(raw)) ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeJSON = (key: string, value: unknown) =>
  AsyncStorage.setItem(key, JSON.stringify(value));

export const removeKey = (key: string) => AsyncStorage.removeItem(key);
