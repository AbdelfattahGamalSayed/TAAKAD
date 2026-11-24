import React, { useMemo, useState } from 'react';
import { ThemeColors } from '../lib/theme';
import { ScrollView, StyleSheet, Text, TextProps, View, Pressable, PressableProps, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../lib/state';

export function useTheme() {
  const { colors, isDark } = useApp();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles, isDark };
}
// Icons accompany visible text or a labelled parent control.
export function Icon(props: React.ComponentProps<typeof Ionicons>) {
  return <Ionicons {...props} accessible={false} aria-hidden importantForAccessibility="no" />;
}
export function Touch({ style, onFocus, onBlur, ...props }: PressableProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return <Pressable {...props} onFocus={event => { setFocused(true); onFocus?.(event); }} onBlur={event => { setFocused(false); onBlur?.(event); }}
    style={state => [{ minHeight: 48, minWidth: 48, justifyContent: 'center', borderRadius: 12 },
      typeof style === 'function' ? style(state) : style,
      focused && { outlineWidth: 3, outlineColor: colors.primary, outlineStyle: 'solid', outlineOffset: 3 },
      state.pressed && { opacity: 0.72 }]} />;
}
export function Txt({ style, ...props }: TextProps) {
  const { rtl } = useApp();
  const { styles } = useTheme();
  const flat = StyleSheet.flatten([styles.text, style]) || styles.text;
  const size = flat.fontSize ?? 17;
  const lineHeight = Math.max(flat.lineHeight ?? 0, Math.ceil(size * 1.45));
  const heading = size >= 28 || style === styles.sectionTitle;
  return <Text accessibilityRole={heading ? 'header' : undefined} {...props} allowFontScaling
    style={[styles.text, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }, style, { lineHeight }]} />;
}
export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { rtl } = useApp();
  return <View style={[{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, minWidth: 0 }, style]}>{children}</View>;
}
export function BrandMark({size=56}:{size?:number}){
 const {colors}=useTheme();
 return <View accessible={false} aria-hidden style={{width:size,height:size,alignItems:'center',justifyContent:'center'}}>
  <Icon name="shield-checkmark-outline" size={size*.86} color={colors.brand}/>
  <View style={{position:'absolute',width:size*1.05,height:size*.375,borderRadius:size*.54,borderBottomWidth:size*.071,borderLeftWidth:size*.071,borderRightWidth:size*.054,borderColor:colors.dangerSolid,transform:[{rotate:'-22deg'}],top:size*.41,left:-size*.054}}/>
 </View>;
}
export function Brand() {
  const { locale, setLocale } = useApp();
  const { colors, styles } = useTheme();
  return <Row style={{ justifyContent: 'space-between', marginBottom: 28, gap: 8 }}>
    <Row style={{ gap: 12, flex: 1 }}>
      <BrandMark/>
      <View style={{ flex: 1 }}><Txt style={{ fontSize: 21, fontWeight: '800', writingDirection: 'ltr' }}>TAAKAD</Txt><Txt style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>تأكّد</Txt></View>
    </Row>
    <Touch accessibilityRole="button" accessibilityLabel={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'} onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')} style={styles.language}>
      <Txt style={{ color: colors.primary, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>{locale === 'en' ? 'عربي' : 'EN'}</Txt>
    </Touch>
  </Row>;
}
export function Screen({ children, brand = true }: { children: React.ReactNode; brand?: boolean }) {
  const { colors, styles } = useTheme();
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
      {brand && <Brand />}{children}
    </ScrollView>
  </SafeAreaView>;
}
export function Button({ title, accessibilityLabel, onPress, disabled = false, secondary = false, icon, tone }: { title: string; accessibilityLabel?:string; onPress: () => void; disabled?: boolean; secondary?: boolean; icon?: keyof typeof Ionicons.glyphMap; tone?:'danger'|'success' }) {
  const { colors, styles } = useTheme();
  const foreground=secondary?(tone==='danger'?colors.iconRed:tone==='success'?colors.iconGreen:colors.primary):colors.onAccent;
  return <Touch accessibilityRole="button" accessibilityLabel={accessibilityLabel||title} accessibilityState={{ disabled }} onPress={onPress} disabled={disabled}
    style={[styles.button, secondary && styles.secondary, tone&&{backgroundColor:secondary?colors.surface:tone==='danger'?colors.dangerSolid:colors.upload,borderWidth:1,borderColor:foreground}, disabled && { opacity: 0.5 }]}>
    <Row style={{ justifyContent: 'center', gap: 12 }}>{icon && <Icon name={icon} size={24} color={foreground} />}
      <Txt style={{ flexShrink: 1, color: foreground, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>{title}</Txt>
    </Row>
  </Touch>;
}
export function Details({ children, testID, title }: { children: React.ReactNode; testID?: string; title?: string }) {
  const { t } = useApp();
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  return <View testID={testID} style={{ marginTop: 24 }}>
    <Touch accessibilityRole="button" accessibilityLabel={title||t.moreDetails} accessibilityState={{ expanded }} aria-expanded={expanded}
      onPress={() => setExpanded(value => !value)} style={{ padding: 16, backgroundColor: colors.primarySoft, borderRadius: 16 }}>
      <Row style={{ justifyContent: 'space-between' }}><Txt style={{ color: colors.primary, fontWeight: '700' }}>{title||t.moreDetails}</Txt><Icon name={expanded ? 'chevron-up' : 'chevron-down'} color={colors.primary} size={24} /></Row>
    </Touch>
    {expanded && <View style={{ paddingTop: 16 }}><View style={{ gap: 16 }}>{children}</View></View>}
  </View>;
}
const createStyles = (colors: ThemeColors) => StyleSheet.create({
  text: { color: colors.text, fontSize: 17, lineHeight: 26, flexShrink: 1 },
  page: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20, paddingBottom: 48 },
  language: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.controlBorder },
  heading: { fontSize: 32, lineHeight: 42, fontWeight: '800' },
  eyebrow: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  muted: { color: colors.muted, fontSize: 17, lineHeight: 26 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 24, padding: 20, marginTop: 24 },
  sectionTitle: { fontSize: 21, lineHeight: 30, fontWeight: '700', marginBottom: 16 },
  button: { backgroundColor: colors.accentSolid, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 16, marginTop: 16, minHeight: 58 },
  secondary: { backgroundColor: colors.primarySoft },
  input: { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.controlBorder, borderRadius: 16, padding: 16, color: colors.text, fontSize: 17, lineHeight: 26, minHeight: 56 },
  error: { backgroundColor: colors.errorBg, borderColor: colors.errorBorder, borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 16 },
});
