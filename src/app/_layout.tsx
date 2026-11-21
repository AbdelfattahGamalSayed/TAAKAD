import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from '../lib/state';
import { useTheme } from '../components/ui';

export default function Layout() { return <AppProvider><AppContent /></AppProvider>; }

function AppContent() {
  const { colors, isDark } = useTheme();
  const { preferencesReady } = useApp();
  const [intro, setIntro] = useState(true);
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(reduced => { if (active && reduced) setIntro(false); });
    const timer = setTimeout(() => Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }).start(() => { if (active) setIntro(false); }), 700);
    return () => { active = false; clearTimeout(timer); };
  }, [opacity]);
  if (!preferencesReady) return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  return <><StatusBar style={isDark ? "light" : "dark"} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />
    {intro && <Animated.View testID="intro" aria-hidden={true} accessibilityElementsHidden={true} pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', opacity }}>
      <View style={{ padding: 28, backgroundColor: colors.accentSolid, borderRadius: 32 }}><Ionicons name="shield-checkmark" color="white" size={65} /></View>
      <Text style={{ color: colors.navy, fontWeight: '900', fontSize: 30, marginTop: 25, letterSpacing: 3 }}>T2AKKAD</Text>
      <Text style={{ color: colors.teal, fontSize: 22, marginTop: 8 }}>تأكّد</Text>
    </Animated.View>}
  </>;
}
