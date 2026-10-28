import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {container, vh, vw} from '../../services/styleSheet';
import {TKey, useI18n} from '../../services/i18n';
import ScreenHeader from '../../components/ScreenHeader';

const QUESTIONS: [TKey, TKey][] = [
  ['faq.q1', 'faq.a1'],
  ['faq.q2', 'faq.a2'],
  ['faq.q3', 'faq.a3'],
  ['faq.q4', 'faq.a4'],
  ['faq.q5', 'faq.a5'],
  ['faq.q6', 'faq.a6'],
];

const FAQ = () => {
  const {t} = useI18n();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('faq.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        {QUESTIONS.map(([question, answer], index) => (
          <TouchableOpacity
            key={question}
            style={styles.card}
            onPress={() => setOpen(open === index ? null : index)}>
            <View style={styles.row}>
              <Text style={styles.question}>{t(question)}</Text>
              <Text style={styles.toggle}>{open === index ? '−' : '+'}</Text>
            </View>
            {open === index ? (
              <Text style={styles.answer}>{t(answer)}</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQ;

const styles = StyleSheet.create({
  container: container,
  content: {
    paddingHorizontal: vw(5),
    paddingBottom: vh(4),
    rowGap: vh(1.5),
  },
  card: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    padding: vw(4),
    rowGap: vh(1),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: vw(3),
  },
  question: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  toggle: {
    color: '#FFED4B',
    fontSize: 18,
    fontWeight: '600',
  },
  answer: {
    color: '#76787E',
    fontSize: 14,
    lineHeight: 20,
  },
});
