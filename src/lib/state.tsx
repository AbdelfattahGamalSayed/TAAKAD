import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors, ThemePreference } from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { copy, Locale } from './copy';
import { Assessment } from './api';

type State = { colors: ThemeColors; isDark: boolean; themePreference: ThemePreference; setThemePreference: (value: ThemePreference) => void; preferencesReady: boolean; locale: Locale; setLocale: (v: Locale) => void; rtl: boolean; t: typeof copy.en | typeof copy.ar; result: Assessment | null; setResult: (v: Assessment | null) => void };
const Context = createContext<State | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>('en');
  const systemTheme = useColorScheme();
  const [themePreference, updateThemePreference] = useState<ThemePreference>('system');
  const [preferencesReady, setPreferencesReady] = useState(false);
  const isDark = themePreference === 'dark' || (themePreference === 'system' && systemTheme === 'dark');
  const colors = isDark ? darkColors : lightColors;
  const setThemePreference = (value: ThemePreference) => { updateThemePreference(value); AsyncStorage.setItem('t2akkad-theme', value).catch(() => {}); };
  const [result, setResult] = useState<Assessment | null>(null);
  useEffect(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem('t2akkad-language'), AsyncStorage.getItem('t2akkad-theme')]).then(([language, theme]) => {
      if (!active) return;
      if (language === 'ar' || language === 'en') updateLocale(language);
      if (theme === 'light' || theme === 'dark' || theme === 'system') updateThemePreference(theme);
    }).catch(() => {}).finally(() => { if (active) setPreferencesReady(true); });
    return () => { active = false; };
  }, []);
  const setLocale = (value: Locale) => { updateLocale(value); AsyncStorage.setItem('t2akkad-language', value).catch(() => {}); };
  return <Context.Provider value={{ colors, isDark, themePreference, setThemePreference, preferencesReady, locale, setLocale, rtl: locale === 'ar', t: copy[locale], result, setResult }}>{children}</Context.Provider>;
}
export function useApp() { const value = useContext(Context); if (!value) throw new Error('Missing AppProvider'); return value; }
