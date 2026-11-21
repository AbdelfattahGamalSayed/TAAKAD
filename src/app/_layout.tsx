import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Icon as Ionicons , useTheme } from '../components/ui';
import { AppProvider, useApp } from '../lib/state';

export default function Layout() { return <AppProvider><AppContent /></AppProvider>; }

function AppContent() {
  const { colors, isDark } = useTheme();
  const { preferencesReady } = useApp();
  const [intro, setIntro] = useState(true);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(reduced => { if (active) setReducedMotion(reduced); }).catch(() => { if (active) setReducedMotion(true); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if (reducedMotion !== false) return;
    let active = true;
    const timer = setTimeout(() => Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }).start(() => { if (active) setIntro(false); }), 700);
    return () => { active = false; clearTimeout(timer); opacity.stopAnimation(); };
  }, [opacity, reducedMotion]);
  if (!preferencesReady) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return <><StatusBar style={isDark ? "light" : "dark"} />
    <Stack screenOptions={{ headerShown: false, animation: reducedMotion !== false ? 'none' : 'default', contentStyle: { backgroundColor: colors.background } }} />
    {intro && reducedMotion === false && <Animated.View testID="intro" aria-hidden={true} accessibilityElementsHidden={true} pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', opacity }}>
      <View style={{ padding: 28, backgroundColor: colors.accentSolid, borderRadius: 32 }}><Ionicons name="shield-checkmark" color={colors.onAccent} size={65} /></View>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 30, marginTop: 25, letterSpacing: 3 }}>T2AKKAD</Text>
      <Text style={{ color: colors.primary, fontSize: 22, marginTop: 8 }}>تأكّد</Text>
    </Animated.View>}
  </>;
}
