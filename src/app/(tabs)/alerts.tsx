import React,{useEffect,useRef,useState} from 'react';
import { ActivityIndicator,Linking,View } from 'react-native';
import { Button,Details,Icon,Row,Screen,Txt,useTheme } from '../../components/ui';
import { useApp } from '../../lib/state';
import { alertsCopy,getAlerts,type AlertFeed } from '../../lib/alerts';
import {InterestFilter} from '../../components/interests';
import {interestCopy,matchesInterest} from '../../lib/interests';
const SOURCE='https://www.mediaoffice.abudhabi';
export default function AlertsScreen(){const {locale}=useApp();return <AlertsContent key={locale}/>;}
function AlertsContent(){
 const {locale,interest,setInterest}=useApp();const {colors,styles}=useTheme();const t=alertsCopy[locale];
 const [feed,setFeed]=useState<AlertFeed|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[recent,setRecent]=useState(false);
 const reload=useRef<()=>void>(()=>{});
 useEffect(()=>{
  let active=true,poll:ReturnType<typeof setTimeout>|undefined;let controller:AbortController|null=null;

  async function load(){
   if(poll)clearTimeout(poll);controller?.abort();controller=new AbortController();const current=controller;
   const timeout=setTimeout(()=>current.abort(),15000);setBusy(true);
   try{const data=await getAlerts(locale,current.signal);if(!active||current!==controller)return;setFeed(data);setError('');if(data.refreshing)poll=setTimeout(load,4000);}
   catch{if(active&&current===controller)setError(alertsCopy[locale].offline);}
   finally{clearTimeout(timeout);if(active&&current===controller)setBusy(false);}
  }
  reload.current=()=>{void load();};void load();const timer=setInterval(()=>void load(),60000);
  return()=>{active=false;controller?.abort();clearInterval(timer);if(poll)clearTimeout(poll);};
 },[locale]);
 function open(url:string){
  try{const u=new URL(url);if(u.origin!==SOURCE||u.username||u.password)throw Error();void Linking.openURL(url).catch(()=>setError(t.linkError));}
  catch{setError(t.linkError);}
 }
 const date=(value:string)=>new Date(value).toLocaleString(locale==='ar'?'ar-AE':'en-GB',{timeZone:'Asia/Dubai',dateStyle:'medium',timeStyle:'short'});
 const items=feed?.items.filter(i=>(!recent||!i.older)&&matchesInterest(i.title+' '+i.excerpt,interest))||[];
 return <Screen>
  <Row><Icon name="notifications" color={colors.iconRed} size={34}/><Txt style={styles.heading}>{t.title}</Txt></Row><Txt style={[styles.muted,{marginTop:12}]}>{t.intro}</Txt>
  <Button title={t.refresh} icon="refresh-outline" onPress={()=>reload.current()} disabled={busy}/>
  <InterestFilter/>
  {interest!=='all'&&<><Txt style={[styles.muted,{marginTop:12}]}>{interestCopy[locale].filtered}</Txt><Button title={interestCopy[locale].all} secondary onPress={()=>setInterest('all')}/></>}
  {(busy||feed?.refreshing)&&<Row style={{marginTop:18}}><ActivityIndicator color={colors.primary}/><Txt style={styles.muted}>{t.loading}</Txt></Row>}
  {!!error&&<Txt accessibilityRole="alert" style={styles.error}>{error}</Txt>}
  {feed&&!feed.refreshing&&feed.sources.some(s=>s.status!=='ready')&&<Txt style={styles.error}>{t.partial}</Txt>}
  {feed&&<View style={{marginTop:18}}>

   <Row><View style={{flex:1}}><Button title={t.all} secondary={recent} onPress={()=>setRecent(false)}/></View><View style={{flex:1}}><Button title={t.recent} secondary={!recent} onPress={()=>setRecent(true)}/></View></Row>
  </View>}
  {feed&&!feed.refreshing&&!recent&&feed.recentCount===0&&feed.items.length>0&&<Txt style={[styles.muted,{marginTop:18}]}>{t.noRecent}</Txt>}
  {feed&&!feed.refreshing&&items.length===0&&<Txt style={[styles.muted,{marginTop:22}]}>{t.empty}</Txt>}
  {items.map(item=><View key={item.id} style={styles.card}>
   <Row style={{marginBottom:12}}><Icon name={item.older||item.stale?'time':'warning'} size={28} color={item.older||item.stale?colors.iconAmber:colors.iconRed}/><Txt style={{fontWeight:'700',color:item.older||item.stale?colors.iconAmber:colors.iconRed}}>{item.older?t.older:t.update}</Txt></Row>
   <Txt style={styles.sectionTitle}>{item.title}</Txt>
   <Txt style={{color:colors.primary,fontSize:16,fontWeight:'700'}}>{locale==='ar'?"مكتب أبوظبي الإعلامي":item.publisher}</Txt>
   <Txt style={[styles.muted,{fontSize:16,marginTop:8}]}>{t.published}: {date(item.publishedAt)}</Txt>
   {(item.stale||!!error)&&<Txt style={[styles.muted,{fontSize:16,marginTop:10}]}>{t.stale}</Txt>}
   <Button title={t.open} icon="open-outline" secondary onPress={()=>open(item.url)}/>
   {!!item.excerpt&&<Details title={t.excerpt}><Txt style={{fontSize:16}}>{item.excerpt}</Txt></Details>}
  </View>)}
  <Txt style={[styles.muted,{marginTop:18}]}>{t.note}</Txt>
  <Details testID="alerts-details">
  <View style={styles.card}><Txt style={{fontSize:16}}>{t.scope}</Txt><Txt style={[styles.muted,{fontSize:16,marginTop:12}]}>{t.frequency}</Txt>
   {feed?.checkedAt&&<Txt style={[styles.muted,{fontSize:16,marginTop:10}]}>{t.checked}: {date(feed.checkedAt)}</Txt>}
   {feed?.nextCheckAt&&<Txt style={[styles.muted,{fontSize:16}]}>{t.next}: {date(feed.nextCheckAt)}</Txt>}
  </View>
  {feed&&<Row>{feed.sources.map(s=><Txt key={s.id} style={{flex:1,fontSize:16,color:colors.muted}}>{t[s.category as 'security'|'technology'|'community']} - {s.status==='ready'?t.ready:s.status==='stale'?t.cached:t.unavailable}</Txt>)}</Row>}
  <Button title={t.permission} icon="open-outline" secondary onPress={()=>open(SOURCE+'/'+locale+'/rss-news-feeds-abu-dhabi-media-office/')}/>
  </Details>
 </Screen>;
}
