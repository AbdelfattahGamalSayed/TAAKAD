import { Tabs } from 'expo-router';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon as Ionicons , Touch, Txt, useTheme } from '../../components/ui';
import { useApp } from '../../lib/state';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t, locale, rtl } = useApp();
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return <Tabs tabBar={({ state, descriptors, emitter, navigateToTab }) => <View style={{ backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8, paddingLeft: insets.left, paddingRight: insets.right }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={fontScale > 1.3} contentContainerStyle={{ flexGrow: 1, flexDirection: rtl ? 'row-reverse' : 'row', paddingHorizontal: 8, gap: 2 }}>
      {state.routes.map((route, index) => {
        const selected = state.index === index;
        const options = descriptors[route.key].options;
        const label = options.title || route.name;
        const color = selected ? colors.primary : colors.muted;
        return <Touch key={route.key} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected }} aria-selected={selected}
          onPress={() => { const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!selected && !event.defaultPrevented) navigateToTab(route.key); }}
          onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
          style={{ flex: 1, minWidth: 70 * Math.max(1, fontScale), minHeight: 64, paddingVertical: 8, paddingHorizontal: 2, alignItems: 'center', gap: 4, borderRadius: 16, backgroundColor: selected ? colors.primarySoft : colors.surface }}>
          {options.tabBarIcon?.({ focused: selected, color, size: 26 })}
          <Txt style={{ color, fontSize: 13, fontWeight: selected ? '800' : '600', textAlign: 'center' }}>{label}</Txt>
        </Touch>;
      })}
    </ScrollView>
  </View>} screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.line }, tabBarLabelStyle: { fontWeight: '600', fontSize:16 } }}>
    <Tabs.Screen name="index" options={{ title: t.check, tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" color={typeof color === 'string' ? color : colors.primary} size={size} /> }} />
    <Tabs.Screen name="alerts" options={{ title: locale === "ar" ? "التنبيهات" : "Alerts", tabBarIcon: ({ size }) => <Ionicons name="notifications" color={colors.iconRed} size={size} /> }} />
    <Tabs.Screen name="learn" options={{ title: t.learn, tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={typeof color === 'string' ? color : colors.primary} size={size} /> }} />
    <Tabs.Screen name="community" options={{ title: t.community, tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={typeof color === 'string' ? color : colors.primary} size={size} /> }} />
    <Tabs.Screen name="settings" options={{ title: t.settings, tabBarIcon: ({ color, size }) => <Ionicons name="options-outline" color={typeof color === 'string' ? color : colors.primary} size={size} /> }} />
  </Tabs>;
}
