import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {container, vh, vw} from '../../services/styleSheet';
import {Lang, useI18n} from '../../services/i18n';
import ScreenHeader from '../../components/ScreenHeader';

// Each language is shown in its own name so it's recognizable either way.
const LANGUAGES: {key: Lang; label: string}[] = [
  {key: 'vi', label: 'Tiếng Việt'},
  {key: 'en', label: 'English'},
];

const Language = () => {
  const {t, lang, setLang} = useI18n();
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('language.title')} />
      <View style={styles.content}>
        {LANGUAGES.map(item => (
          <TouchableOpacity
            key={item.key}
            testID={`language-${item.key}`}
            accessibilityRole="radio"
            accessibilityState={{selected: lang === item.key}}
            style={styles.option}
            onPress={() => setLang(item.key)}>
            <Text style={styles.label}>{item.label}</Text>
            <View style={styles.radio}>
              {lang === item.key ? <View style={styles.radioInner} /> : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default Language;

const styles = StyleSheet.create({
  container: container,
  content: {
    paddingHorizontal: vw(5),
    rowGap: vh(1.5),
  },
  option: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    padding: vw(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#76787E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFED4B',
  },
});
