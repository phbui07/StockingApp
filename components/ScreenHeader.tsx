import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {backIcon} from '../assets/svgXML';
import {vh, vw} from '../services/styleSheet';
import {useI18n} from '../services/i18n';

// Back button, centered title and an optional action on the right, matching
// the header the stock detail screens already used.
const ScreenHeader: React.FC<{title: string; right?: React.ReactNode}> = ({
  title,
  right,
}) => {
  const navigation = useNavigation();
  const {t} = useI18n();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => navigation.goBack()}>
        {backIcon(vw(6), vw(6), '#76787E')}
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({
  container: {
    paddingVertical: vh(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: vw(5),
    borderWidth: 1,
    borderColor: '#76787E',
    borderRadius: 10,
    padding: vw(1.5),
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: vw(60),
  },
  right: {
    position: 'absolute',
    right: vw(5),
  },
});
