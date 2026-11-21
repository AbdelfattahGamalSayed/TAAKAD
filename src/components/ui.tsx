import React, { useMemo } from 'react';
import { ThemeColors } from '../lib/theme';
import { ScrollView, StyleSheet, Text, TextProps, View, Pressable, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../lib/state';

export function useTheme() {
  const { colors, isDark } = useApp();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles, isDark };
}
export function Txt({ style, ...props }: TextProps) {
  const { rtl } = useApp();
  const { styles } = useTheme();
  return <Text {...props} style={[styles.text, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }, style]} />;
}
export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { rtl } = useApp();
  return <View style={[{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }, style]}>{children}</View>;
}
export function Brand() {
  const { locale, setLocale, t } = useApp();
  const { colors, styles } = useTheme();
  return <Row style={{ justifyContent: 'space-between', marginBottom: 32 }}>
    <Row style={{ gap: 10 }}>
      <View style={styles.logo}><Ionicons name="shield-checkmark" size={28} color={colors.onAccent} /></View>
      <View><Txt style={{ fontSize: 22, fontWeight: '900', letterSpacing: 1 }}>T2AKKAD</Txt><Txt style={{ fontSize: 10, color: colors.teal, letterSpacing: 0.7, fontWeight: '600' }}>{t.tagline}</Txt></View>
    </Row>
    <Pressable accessibilityRole="button" accessibilityLabel={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'} onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')} style={styles.language}><Text style={{ color: colors.navy, fontWeight: '700' }}>{locale === 'en' ? 'عربي' : 'EN'}</Text></Pressable>
  </Row>;
}
export function Screen({ children, brand = true }: { children: React.ReactNode; brand?: boolean }) {
  const { colors, styles } = useTheme();
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      {brand && <Brand />}{children}
    </ScrollView>
  </SafeAreaView>;
}
export function Button({ title, onPress, disabled = false, secondary = false, icon }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  const { colors, styles } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.button, secondary && styles.secondary, { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 }]}>
    <Row style={{ justifyContent: 'center', gap: 9 }}>{icon && <Ionicons name={icon} size={20} color={secondary ? colors.teal : colors.onAccent} />}<Txt style={{ color: secondary ? colors.teal : colors.onAccent, fontSize: 15, fontWeight: '700', textAlign: 'center' }}>{title}</Txt></Row>
  </Pressable>;
}
const createStyles = (colors: ThemeColors) => StyleSheet.create({
  text: { color: colors.navy, fontSize: 15, lineHeight: 23 },
  page: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: 22, paddingBottom: 38 },
  logo: { backgroundColor: colors.accentSolid, width: 46, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  language: { backgroundColor: colors.subtle, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, minWidth: 48, alignItems: 'center' },
  heading: { fontSize: 36, lineHeight: 43, fontWeight: '800', letterSpacing: -1.2 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4, color: colors.teal, marginBottom: 12 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 24, padding: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  button: { backgroundColor: colors.accentSolid, borderRadius: 15, paddingVertical: 17, paddingHorizontal: 12, marginTop: 18, minHeight: 54 },
  secondary: { backgroundColor: colors.mint },
  input: { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, color: colors.navy, fontSize: 15, lineHeight: 23 },
  error: { backgroundColor: colors.errorBg, borderColor: colors.errorBorder, borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 16 },
});
