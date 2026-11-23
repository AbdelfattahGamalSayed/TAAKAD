import {useState} from 'react';
import {View} from 'react-native';
import * as Linking from 'expo-linking';
import {Button,Details,Icon,Row,Touch,Txt,useTheme} from './ui';
import {useApp} from '../lib/state';
import {handoffCopy,type DemoHandoff} from '../lib/handoff';
import {helpSources} from '../lib/recovery';

export function OfficialHelp(){
 const {locale}=useApp(),{styles}=useTheme(),c=handoffCopy[locale];
 const [show,setShow]=useState(false),[error,setError]=useState(false);
 function open(url:string){setError(false);Linking.openURL(url).catch(()=>setError(true));}
 return <><Button title={c.help} secondary icon="call-outline" onPress={()=>setShow(!show)}/>{show&&<View style={styles.card}>
  <Txt style={styles.sectionTitle}>{c.help}</Txt><Txt>{c.bank}</Txt>
  <Txt style={{marginTop:20}}>{c.police}</Txt><Button title={c.policeCall} onPress={()=>open('tel:8003333')}/>
  <Txt style={{marginTop:20}}>{c.aman}</Txt><Button title={c.amanCall} secondary onPress={()=>open('tel:8002626')}/>
  <Txt style={{marginTop:20}}>{c.emergency}</Txt><Button title={c.emergencyCall} secondary onPress={()=>open('tel:999')}/>
  <Txt style={[styles.muted,{marginTop:16}]}>{c.manual}</Txt>
  <Button title={c.faq} secondary icon="open-outline" onPress={()=>open(helpSources.scope)}/>
  <Button title={c.contacts} secondary icon="open-outline" onPress={()=>open('https://adpolice.gov.ae/en/ContactUs')}/>
  <Txt style={styles.muted}>{c.checked}</Txt>{error&&<Txt accessibilityRole="alert" style={styles.error}>{c.error}</Txt>}
 </View>}</>;
}

export function SupportHandoff({summary,handoff,busy,onAction}:{summary:string;handoff?:DemoHandoff|null;busy:boolean;onAction:(body:object)=>void}){
 const {locale}=useApp(),{styles,colors}=useTheme(),c=handoffCopy[locale];
 const [show,setShow]=useState(false),[consent,setConsent]=useState(false);
 const active=handoff&&handoff.status!=='revoked';
 return <View style={{marginTop:20}}>
  {handoff&&<><Txt style={styles.sectionTitle}>{c.status}</Txt><Txt>{c.statuses[handoff.status]}</Txt><Txt style={[styles.muted,{marginTop:12}]}>{c.refresh}</Txt>
   <Details><Txt style={styles.sectionTitle}>{c.history}</Txt>{handoff.events.map((e,i)=><Txt key={i} style={{marginTop:12}}>{c.events[e.action as keyof typeof c.events]||e.action} — {new Date(e.at).toLocaleString(locale)}</Txt>)}</Details>
  </>}
  {active?<Button title={c.revoke} secondary disabled={busy} onPress={()=>{setConsent(false);onAction({action:'revoke'});}}/>:<Button title={c.show} secondary disabled={busy} onPress={()=>{setConsent(false);setShow(!show);}}/>}
  {show&&!active&&<>
   <Txt style={styles.sectionTitle}>{c.title}</Txt><Txt>{c.intro}</Txt><Txt style={{marginTop:16,fontWeight:'700'}}>{c.recipient}</Txt>
   <Txt style={{marginTop:16}}>{c.preview}</Txt><Txt style={{marginTop:16}}>{summary}</Txt><Txt style={{marginTop:16}}>{c.contact}</Txt>
   <Txt style={[styles.muted,{marginTop:16}]}>{c.lifetime}</Txt>
   <Touch accessibilityRole="checkbox" accessibilityLabel={c.consent} aria-checked={consent} accessibilityState={{checked:consent}} disabled={busy} onPress={()=>setConsent(!consent)} style={{marginTop:20}}><Row><Icon name={consent?'checkbox':'square-outline'} color={colors.primary} size={24}/><Txt style={{flex:1}}>{c.consent}</Txt></Row></Touch>
   <Button title={c.send} disabled={busy||!consent} onPress={()=>{setConsent(false);onAction({action:'request',consent:true,consentVersion:'demo-handoff-v1'});}}/>
   <Button title={c.cancel} secondary disabled={busy} onPress={()=>{setShow(false);setConsent(false);}}/>
  </>}
 </View>;
}
