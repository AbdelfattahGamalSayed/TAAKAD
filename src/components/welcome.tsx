import { router } from 'expo-router';
import { View } from 'react-native';
import { authCopy, useAuth } from '../lib/auth';
import { useApp } from '../lib/state';
import { BrandMark, Button, Screen, Txt, useTheme } from './ui';
export function Welcome() {
  const {locale}=useApp(),{welcome}=useAuth(),{styles}=useTheme(),c=authCopy[locale];
  return <Screen><BrandMark size={72}/><Txt style={[styles.heading,{marginTop:20}]}>{c.welcome}</Txt><Txt style={[styles.muted,{marginTop:16}]}>{c.intro}</Txt>
    <Button title={c.guest} onPress={welcome}/><Button title={c.phone} secondary icon="call-outline" onPress={()=>{welcome();router.push('/signin');}}/>
    <Button title={c.pass} secondary disabled onPress={()=>{}}/><Txt style={[styles.muted,{marginTop:12}]}>{c.passNote}</Txt>
    <View style={styles.card}><Txt style={styles.sectionTitle}>{c.demo}</Txt><Txt>{c.demoNote}</Txt></View>
  </Screen>;
}
