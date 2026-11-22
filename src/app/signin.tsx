import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button, Screen, Txt, useTheme } from '../components/ui';
import { authCopy, authRequest, useAuth, type Challenge, type DemoSession } from '../lib/auth';
import { useApp } from '../lib/state';
const digits=(text:string)=>text.replace(/[٠-٩۰-۹]/g,char=>String(char.charCodeAt(0)-(char<='٩'?1632:1776)));
export default function SignIn() {
  const {locale}=useApp(),{setSession,welcome}=useAuth(),{colors,styles}=useTheme(),c=authCopy[locale];
  const [phone,setPhone]=useState(''),[code,setCode]=useState(''),[challenge,setChallenge]=useState<Challenge|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(()=>Date.now()),[offset,setOffset]=useState(0);
  const requestId=useRef(0),controller=useRef<AbortController|null>(null);
  const cancel=useCallback(()=>{requestId.current++;controller.current?.abort();controller.current=null;setBusy(false);},[]);
  useFocusEffect(useCallback(()=>()=>cancel(),[cancel]));
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  const expiry=challenge?Math.max(0,Math.ceil((challenge.expiresAt-now-offset)/1000)):0;
  const resend=challenge?Math.max(0,Math.ceil((challenge.resendAt-now-offset)/1000)):0;
  function leave(){cancel();welcome();if(router.canGoBack())router.back();else router.replace('/');}
  async function submit(verify=false) {
    if(controller.current)return;
    setBusy(true);setError('');const id=++requestId.current,abort=new AbortController();controller.current=abort;
    const timer=setTimeout(()=>abort.abort(),10000);
    try {
      if(verify){
        const session:DemoSession=await authRequest('/api/auth/verify',{challengeId:challenge?.challengeId,code:digits(code)},undefined,abort.signal);
        if(id!==requestId.current)return;
        if(session.mode!=='demo'||session.phoneVerified!==false)throw new Error('NETWORK');
        setSession(session);leave();
      } else {
        const next:Challenge=await authRequest('/api/auth/start',{phone:digits(phone)},undefined,abort.signal);
        if(id!==requestId.current)return;
        if(next.mode!=='demo')throw new Error('NETWORK');
        setOffset(next.serverNow-Date.now());setNow(Date.now());setChallenge(next);setCode('');
      }
    }catch(err){if(id===requestId.current)setError((err as Error).message);}
    finally {clearTimeout(timer);if(id===requestId.current){controller.current=null;setBusy(false);}}
  }
  return <Screen key={challenge?'code':'phone'}>
    <Button title={c.back} secondary onPress={leave}/><Txt style={[styles.heading,{marginTop:20}]}>{c.phone}</Txt>
    <View style={styles.card}><Txt style={styles.sectionTitle}>{c.demo}</Txt><Txt>{c.demoNote}</Txt></View>
    <View style={styles.card}>
      {!challenge?<>
        <Txt>{c.number}</Txt><TextInput accessibilityLabel={c.number} keyboardType="phone-pad" autoComplete="tel" autoCapitalize="none" value={phone} maxLength={32} editable={!busy} onChangeText={setPhone} placeholder="+971500000000" placeholderTextColor={colors.placeholder} style={[styles.input,{marginTop:12,writingDirection:'ltr',textAlign:'left'}]}/>
        <Button title={c.sample} secondary disabled={busy} onPress={()=>setPhone('+971500000000')}/><Button title={c.send} disabled={busy||!phone.trim()} onPress={()=>submit()}/>
      </>:<>
        <Txt>{c.shown}</Txt><Txt testID="demo-code" selectable style={{fontSize:28,fontWeight:'700',writingDirection:'ltr',textAlign:'center',marginVertical:12}}>{challenge.demoCode}</Txt>
        <Txt>{c.code}</Txt><TextInput accessibilityLabel={c.code} keyboardType="number-pad" autoComplete="one-time-code" value={code} maxLength={6} editable={!busy&&expiry>0} onChangeText={text=>setCode(digits(text).replace(/\D/g,''))} style={[styles.input,{marginTop:12,writingDirection:'ltr',textAlign:'center'}]}/>
        <Txt style={[styles.muted,{marginTop:16}]}>{expiry?`${c.remaining} ${expiry} ${c.seconds}`:c.expired}</Txt>
        <Button title={c.verify} disabled={busy||expiry===0||code.length!==6} onPress={()=>submit(true)}/>
        <Button title={c.resend} secondary disabled={busy||resend>0} onPress={()=>submit()}/>
        {resend>0&&<Txt style={[styles.muted,{marginTop:12}]}>{c.wait} {resend} {c.seconds}</Txt>}
        <Button title={c.change} secondary disabled={busy} onPress={()=>{cancel();setChallenge(null);setCode('');setError('');}}/>
      </>}
      {busy&&<View style={{marginTop:16}}><ActivityIndicator color={colors.primary}/><Txt accessibilityLiveRegion="polite">{c.working}</Txt></View>}
      {!!error&&<Txt accessibilityRole="alert" style={styles.error}>{c.errors[error as keyof typeof c.errors]||c.errors.NETWORK}</Txt>}
    </View>
    <Button title={c.cancel} secondary onPress={leave}/>
    <Button title={c.pass} secondary disabled onPress={()=>{}}/><Txt style={[styles.muted,{marginTop:12}]}>{c.passNote}</Txt>
    <Txt style={[styles.muted,{marginTop:20}]}>{c.privacy}</Txt>
  </Screen>;
}
