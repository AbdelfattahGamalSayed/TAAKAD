import { Touch as Pressable , Icon as Ionicons , Screen, Txt, Button, Row, useTheme } from '../components/ui';
import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../lib/state';
import { featureCopy, recoverySteps } from '../lib/features';
type Scenario = 'opened'|'password'|'otp'|'payment';
export default function RecoveryScreen() {
 const {locale}=useApp(); const {colors,styles}=useTheme(); const f=featureCopy[locale];
 const [selected,setSelected]=useState<Scenario[]>([]),[done,setDone]=useState<string[]>([]),[error,setError]=useState('');
 const toggle=(id:string)=>setDone(done.includes(id)?done.filter(x=>x!==id):[...done,id]);
 return <Screen>
  <Txt style={styles.heading}>{f.recoveryTitle}</Txt>
  <Txt style={[styles.muted,{marginTop:16}]}>{f.recoveryIntro}</Txt><Txt style={[styles.muted,{marginTop:8}]}>{f.contactSafety}</Txt>
  {(['opened','password','otp','payment'] as Scenario[]).map(s=><View style={styles.card} key={s}>
   <Pressable accessibilityRole="checkbox" aria-checked={selected.includes(s)} accessibilityState={{checked:selected.includes(s)}} onPress={()=>setSelected(selected.includes(s)?selected.filter(x=>x!==s):[...selected,s])}>
    <Row><Ionicons name={selected.includes(s)?'checkbox':'square-outline'} color={colors.primary} size={26}/><Txt style={{flex:1,fontWeight:'700'}}>{f[s]}</Txt></Row>
   </Pressable>
   {selected.includes(s) && <View><Txt style={[styles.muted,{fontSize:16,marginTop:14}]}>{f.check}</Txt>{recoverySteps[locale][s].map((step,i)=>{
    const id=s+i; return <Pressable key={id} accessibilityRole="checkbox" aria-checked={done.includes(id)} accessibilityState={{checked:done.includes(id)}} onPress={()=>toggle(id)} style={{marginTop:18}}>
     <Row style={{alignItems:'flex-start'}}><Ionicons name={done.includes(id)?'checkmark-circle':'ellipse-outline'} size={24} color={colors.primary}/><Txt style={{flex:1}}>{step}</Txt></Row>
    </Pressable>;
   })}</View>}
  </View>)}
  <Txt style={[styles.sectionTitle,{marginTop:24}]}>{f.sourceTitle}</Txt>
  {[['FTC','https://consumer.ftc.gov/articles/what-do-if-you-were-scammed'],['NCSC','https://www.ncsc.gov.uk/collection/phishing-scams/what-to-do']].map(([title,url])=><Button key={title} title={title+' ↗'} secondary onPress={()=>{Linking.openURL(url).catch(()=>setError(locale==='ar'?"تعذّر فتح الصفحة. تحقّق من الإنترنت وحاول مجدداً.":"Could not open the page. Check your internet and try again."));}}/>)}
  {!!error&&<Txt accessibilityRole="alert">{error}</Txt>}
  <Button title={f.back} onPress={()=>router.canGoBack()?router.back():router.replace('/')}/>
 </Screen>;
}
