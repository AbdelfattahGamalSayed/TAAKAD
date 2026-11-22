import { Touch as Pressable , Icon as Ionicons , Button, Details, Row, Screen, Txt, useTheme } from '../../components/ui';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useApp } from '../../lib/state';
import { health } from '../../lib/api';
import { router } from 'expo-router';
import { authCopy, authRequest, useAuth } from '../../lib/auth';

export default function SettingsScreen() {
  const { colors, styles } = useTheme();
  const { t, locale, setLocale, setResult, themePreference, setThemePreference } = useApp();
  const {session,setSession,welcome}=useAuth(),a=authCopy[locale];
  const [signoutError,setSignoutError]=useState(false);
  const [connection, setConnection] = useState<'checking' | 'ready' | 'configuring' | 'offline'>('checking');
  const [cleared, setCleared] = useState(false);
  async function refresh() { setConnection('checking'); try { const status = await health(); setConnection(status.configured ? 'ready' : 'configuring'); } catch { setConnection('offline'); } }
  useEffect(() => { let active = true; health().then(status => { if (active) setConnection(status.configured ? 'ready' : 'configuring'); }).catch(() => { if (active) setConnection('offline'); }); return () => { active = false; }; }, []);
  return <Screen><Txt style={styles.heading}>{t.settingTitle}</Txt><Txt style={[styles.muted, { marginTop: 10 }]}>{t.settingSub}</Txt>
    <View style={styles.card}><Txt style={styles.sectionTitle}>{a.account}</Txt><Txt>{session?a.session:a.guestStatus}</Txt>
      {session?<Button title={a.signout} secondary onPress={()=>{const token=session.token;setSession(null);setSignoutError(false);authRequest('/api/auth/logout',{},token).catch(()=>setSignoutError(true));}}/>:<Button title={a.phone} secondary onPress={()=>{welcome();router.push('/signin');}}/>}
      {signoutError&&<Txt accessibilityRole="alert">{a.logoutFailure}</Txt>}
    </View>
    <View style={styles.card}><Txt style={styles.sectionTitle}>{t.language}</Txt><Row>{(['en', 'ar'] as const).map(language => <Pressable accessibilityRole="radio" aria-checked={locale === language} accessibilityState={{ checked: locale === language }} key={language} onPress={() => setLocale(language)} style={{ flex: 1, padding: 15, borderRadius: 14, backgroundColor: locale === language ? colors.accentSolid : colors.subtle }}><Txt style={{ textAlign: 'center', fontWeight: '700', color: locale === language ? colors.onAccent : colors.text }}>{language === 'en' ? 'English' : 'العربية'}</Txt></Pressable>)}</Row></View>
    <View style={styles.card}>
      <Txt style={styles.sectionTitle}>{t.appearance}</Txt>
      <Txt style={[styles.muted, { marginBottom: 16 }]}>{t.appearanceHint}</Txt>
      <Row style={{ gap: 8 }}>{(['system', 'light', 'dark'] as const).map(value => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={value === 'system' ? t.themeSystem : value === 'light' ? t.themeLight : t.themeDark} aria-checked={themePreference === value} accessibilityState={{ checked: themePreference === value }} onPress={() => setThemePreference(value)} style={{ flex: 1, minHeight: 78, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, backgroundColor: themePreference === value ? colors.primarySoft : colors.input, borderWidth: 1, borderColor: themePreference === value ? colors.primary : colors.line }}>
        <Ionicons name={value === 'system' ? 'phone-portrait-outline' : value === 'light' ? 'sunny-outline' : 'moon-outline'} size={22} color={themePreference === value ? colors.primary : colors.muted} />
        <Txt style={{ textAlign: 'center', color: themePreference === value ? colors.primary : colors.muted, fontSize:16, fontWeight: '700' }}>{value === 'system' ? t.themeSystem : value === 'light' ? t.themeLight : t.themeDark}</Txt>
      </Pressable>)}</Row>
    </View>
    <View style={styles.card}><Row style={{ marginBottom: 12 }}><Ionicons name="lock-closed-outline" color={colors.primary} size={23} /><Txt style={{ fontSize: 18, fontWeight: '700' }}>{t.privacyTitle}</Txt></Row><Txt style={styles.muted}>{t.privacyBody}</Txt><Button secondary title={cleared ? t.cleared : t.clear} onPress={() => { setResult(null); setCleared(true); }} /></View>
    <View style={styles.card}><Txt style={styles.sectionTitle}>{t.prototype}</Txt><Txt style={styles.muted}>{t.prototypeBody}</Txt><Txt style={{ color: colors.primary, fontWeight: '600', marginTop: 18, fontSize:16 }}>T2AKKAD · 0.1.0</Txt></View>
    <Details testID="settings-details">
    <View style={styles.card}><Txt style={styles.sectionTitle}>{t.connection}</Txt><Row>{connection === 'checking' ? <ActivityIndicator color={colors.primary} /> : <><View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: connection === 'ready' ? colors.primary : colors.amber }} /><Txt style={{ fontWeight: '600' }}>{t[connection]}</Txt></>}</Row><Button title={t.refresh} secondary onPress={refresh} disabled={connection === 'checking'} /><Txt style={{ color: colors.muted, fontSize:16, lineHeight:24, marginTop: 15 }}>{t.localNetwork}</Txt></View>
      <Txt style={styles.muted}>{t.dataDetails}</Txt><Txt style={styles.muted}>{t.aboutDetails}</Txt>
    </Details>
  </Screen>;
}
