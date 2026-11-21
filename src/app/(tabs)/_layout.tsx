import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../components/ui';
import { useApp } from '../../lib/state';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t, locale } = useApp();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.teal, tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line }, tabBarLabelStyle: { fontWeight: '600', fontSize: 11 } }}>
    <Tabs.Screen name="index" options={{ title: t.check, tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" color={typeof color === 'string' ? color : colors.teal} size={size} /> }} />
    <Tabs.Screen name="alerts" options={{ title: locale === "ar" ? "التنبيهات" : "Alerts", tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" color={typeof color === "string" ? color : colors.teal} size={size} /> }} />
    <Tabs.Screen name="learn" options={{ title: t.learn, tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={typeof color === 'string' ? color : colors.teal} size={size} /> }} />
    <Tabs.Screen name="community" options={{ title: t.community, tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={typeof color === 'string' ? color : colors.teal} size={size} /> }} />
    <Tabs.Screen name="settings" options={{ title: t.settings, tabBarIcon: ({ color, size }) => <Ionicons name="options-outline" color={typeof color === 'string' ? color : colors.teal} size={size} /> }} />
  </Tabs>;
}
