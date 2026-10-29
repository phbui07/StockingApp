import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {vh, vw} from '../services/styleSheet';
import {useI18n} from '../services/i18n';
import {
  AiError,
  GEMINI_KEY_URL,
  saveApiKey,
  verifyApiKey,
} from '../services/aiExplainer';

const ApiKeyForm: React.FC<{onSaved: () => void}> = ({onSaved}) => {
  const {t} = useI18n();
  const [key, setKey] = useState('');
  const [checking, setChecking] = useState(false);

  const save = async () => {
    setChecking(true);
    try {
      await verifyApiKey(key);
      await saveApiKey(key);
      onSaved();
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t(
          error instanceof AiError && error.code === 'INVALID_KEY'
            ? 'insights.errorInvalidKey'
            : 'insights.errorNetwork',
        ),
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => Linking.openURL(GEMINI_KEY_URL)}>
        <Text style={styles.link}>{t('insights.getKey')} ↗</Text>
      </TouchableOpacity>
      <TextInput
        testID="ai-key-input"
        style={styles.input}
        value={key}
        onChangeText={setKey}
        placeholder={t('insights.keyPlaceholder')}
        placeholderTextColor="#76787E"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />
      <TouchableOpacity
        testID="ai-key-save"
        style={[styles.button, !key.trim() && styles.disabled]}
        disabled={!key.trim() || checking}
        onPress={save}>
        {checking ? (
          <ActivityIndicator color="#1A1A1A" />
        ) : (
          <Text style={styles.buttonText}>{t('insights.saveKey')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ApiKeyForm;

const styles = StyleSheet.create({
  container: {
    rowGap: vh(1),
  },
  link: {
    color: '#FFED4B',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#76787E',
    borderRadius: 12,
    height: vw(12),
    color: '#FFFFFF',
    paddingHorizontal: vw(4),
  },
  button: {
    backgroundColor: '#FFED4B',
    borderRadius: 16,
    paddingVertical: vh(1.5),
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
});
