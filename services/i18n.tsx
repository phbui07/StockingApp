import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import vi from '../locales/vi';
import en from '../locales/en';
import {readJSON, writeJSON} from './storage';

export type Lang = 'vi' | 'en';
export type TKey = keyof typeof vi;
type Params = Record<string, string | number>;

const dictionaries: Record<Lang, Record<TKey, string>> = {vi, en};
const LANGUAGE_KEY = 'stockline.language';
let currentLang: Lang = 'vi';

export const translate = (lang: Lang, key: TKey, params?: Params) => {
  const template = dictionaries[lang][key] ?? key;
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
};

// For code outside React components, such as notification text.
export const translateNow = (key: TKey, params?: Params) =>
  translate(currentLang, key, params);

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TKey, params?: Params) => string;
}

const I18nContext = createContext<I18nValue>({
  lang: 'vi',
  setLang: () => {},
  t: (key, params) => translate('vi', key, params),
});

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [lang, setLangState] = useState<Lang>(currentLang);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    readJSON<Lang>(LANGUAGE_KEY, 'vi').then(saved => {
      if (saved === 'vi' || saved === 'en') {
        currentLang = saved;
        setLangState(saved);
      }
      setLoaded(true);
    });
  }, []);

  const setLang = useCallback((next: Lang) => {
    currentLang = next;
    setLangState(next);
    writeJSON(LANGUAGE_KEY, next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, params) => translate(lang, key, params),
    }),
    [lang, setLang],
  );

  // Wait for the saved language so the first screen doesn't flash in Vietnamese.
  if (!loaded) {
    return null;
  }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
