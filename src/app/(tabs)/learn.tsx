import { View } from 'react-native';
import { Icon as Ionicons , Row, Screen, Txt, useTheme } from '../../components/ui';
import { useApp } from '../../lib/state';
import { lessons } from '../../lib/copy';

export default function LearnScreen() {
  const { colors, styles } = useTheme();
  const { t, locale } = useApp();
  return <Screen><Txt style={styles.eyebrow}>{t.library}</Txt><Txt style={[styles.heading, { fontSize: 33 }]}>{t.learnTitle}</Txt><Txt style={[styles.muted, { marginTop: 14 }]}>{t.learnSub}</Txt>
    {lessons.map((lesson, i) => <View style={styles.card} key={i}><Row style={{ alignItems: 'flex-start', marginBottom: 14 }}><View style={{ padding: 12, borderRadius: 14, backgroundColor: colors.primarySoft }}><Ionicons name={lesson.icon} color={colors.primary} size={25} /></View><Txt style={{ flex: 1, fontSize: 18, fontWeight: '700', paddingTop: 5 }}>{lesson[locale][0]}</Txt></Row><Txt style={{ color: colors.muted, lineHeight: 24, fontSize:16 }}>{lesson[locale][1]}</Txt></View>)}
    <Txt style={{ textAlign: 'center', color: colors.muted, fontSize:16, marginTop: 25 }}>{t.educational}</Txt>
  </Screen>;
}
