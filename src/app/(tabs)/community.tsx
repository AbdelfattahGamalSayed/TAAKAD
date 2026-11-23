import {useCallback,useRef,useState} from 'react';
import {ActivityIndicator,TextInput,View} from 'react-native';
import {router,useFocusEffect} from 'expo-router';
import {Button,Details,Icon,Row,Screen,Touch,Txt,useTheme} from '../../components/ui';
import {useApp} from '../../lib/state';
import {authRequest,useAuth} from '../../lib/auth';
import {emptyReport,reportCopy,type ScamReport} from '../../lib/reports';
import {OfficialHelp,SupportHandoff} from '../../components/support';
export default function CommunityScreen(){
 const {locale,rtl}=useApp(),{colors,styles}=useTheme(),c=reportCopy[locale];
 const {session,setSession,welcome,draft,setDraft,reportDraft,setReportDraft}=useAuth();
 const [view,setView]=useState<'feed'|'mine'|'form'|'preview'>(reportDraft.channel?'form':'feed'),[step,setStep]=useState(reportDraft.channel?2:0);
 const [items,setItems]=useState<ScamReport[]>([]),[itemsOwner,setItemsOwner]=useState(''),[itemsView,setItemsView]=useState('');
 const [preview,setPreview]=useState<ScamReport|null>(null),[previewOwner,setPreviewOwner]=useState(''),[consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[flag,setFlag]=useState(''),[notice,setNotice]=useState('');
 const generation=useRef(0);
 const request=async(path:string,body:object={})=>authRequest('/api/reports/'+path,body,session?.token,path==='prepare'?AbortSignal.timeout(55000):undefined);
 const signin=()=>{welcome();router.push('/signin');};
 const load=useCallback(async()=>{
   const id=++generation.current;setBusy(true);setError('');
   try{const result=await authRequest('/api/reports/'+(view==='mine'?'mine':'list'),{},session?.token);if(id===generation.current){setItems(result.items);setItemsView(view);setItemsOwner(session?.token||'');}}
   catch(err){if(id===generation.current){setError((err as Error).message);if((err as Error).message==='AUTH_REQUIRED')setSession(null);}}
   finally{if(id===generation.current)setBusy(false);}
 },[view,session,setSession]);
 useFocusEffect(useCallback(()=>{if(view==='feed'||(view==='mine'&&session))void load();return()=>{generation.current++;setBusy(false);};},[load,view,session]));
 async function act(action:'prepare'|'publish'|'withdraw'|'flag'|'handoff',body:object={}){
   if(busy)return;if(action!=='flag'&&!session){signin();return;}
   const id=++generation.current;setBusy(true);setError('');setNotice('');
   try{
     const result=await request(action,body);if(id!==generation.current)return;
     if(action==='prepare'){setPreview(result);setPreviewOwner(session!.token);setConsent(false);setView('preview');}
     else if(action==='publish'){setDraft('');setReportDraft(emptyReport);setPreview(null);setView('mine');}
     else if(action==='flag'){setFlag('');setNotice(c.flagSent);await load();}
     else await load();
   }catch(err){if(id===generation.current){setError((err as Error).message);if((err as Error).message==='AUTH_REQUIRED')setSession(null);}}
   finally{if(id===generation.current)setBusy(false);}
 }
 function change(key:'channel'|'request'|'outcome',value:string){setReportDraft({...reportDraft,[key]:value});setConsent(false);setError('');}
 function options(key:'channel'|'request'|'outcome'){
   return Object.entries(c[key]).map(([value,label])=><Touch key={value} accessibilityRole="radio" accessibilityLabel={label} aria-checked={reportDraft[key]===value} accessibilityState={{checked:reportDraft[key]===value}} disabled={busy} onPress={()=>change(key,value)} style={{padding:16,marginTop:12,borderWidth:1,borderColor:colors.controlBorder,backgroundColor:reportDraft[key]===value?colors.primarySoft:colors.surface}}><Row><Icon name={reportDraft[key]===value?'radio-button-on':'radio-button-off'} size={24} color={colors.primary}/><Txt style={{flex:1}}>{label}</Txt></Row></Touch>);
 }
 const publicPreview=view==='preview'&&preview&&previewOwner===session?.token;
 const form=view==='form'||(view==='preview'&&!publicPreview);
 const visibleItems=itemsView!==view||(view==='mine'&&itemsOwner!==session?.token)?[]:items;
 return <Screen key={`${view}:${step}`}>
  <Txt style={styles.heading}>{c.title}</Txt><Txt style={[styles.muted,{marginTop:12}]}>{c.intro}</Txt>
  <View style={[styles.card,{backgroundColor:colors.primarySoft}]}><Txt style={{fontWeight:'700'}}>{c.demo}</Txt><Txt style={[styles.muted,{marginTop:8}]}>{locale==='en'?'Shared within this demo. Reports expire within one hour.':'المشاركة ضمن هذه النسخة فقط. تنتهي البلاغات خلال ساعة.'}</Txt></View>
  <OfficialHelp/>
  <Row style={{flexWrap:'wrap',marginTop:16}}><Button title={c.feed} secondary disabled={busy} onPress={()=>{setView('feed');setError('');}}/><Button title={c.mine} secondary disabled={busy} onPress={()=>{setView('mine');setError('');}}/></Row>
  {(view==='feed'||view==='mine')&&<Button title={c.start} icon="add-circle-outline" disabled={busy} onPress={()=>{setView('form');setStep(reportDraft.channel?2:0);setError('');setNotice('');}}/>}
  {form&&<View style={styles.card}>
    <Txt style={styles.eyebrow}>{step+1} / 3</Txt><Txt style={styles.sectionTitle}>{c.questions[step]}</Txt>
    {step===0&&options('channel')}{step===1&&options('request')}
    {step===2&&<>{options('outcome')}<Txt style={[styles.sectionTitle,{marginTop:20}]}>{c.helpQuestion}</Txt>
      <Row>{[true,false].map(value=><Button key={String(value)} title={value?c.yes:c.no} secondary={reportDraft.needsHelp!==value} disabled={busy} onPress={()=>setReportDraft({...reportDraft,needsHelp:value})}/>)}</Row>
      {reportDraft.needsHelp&&<><Txt style={[styles.muted,{marginTop:16}]}>{c.helpNote}</Txt><Button title={c.help} secondary onPress={()=>router.push('/recovery')}/></>}
      <Txt style={{marginTop:20,fontWeight:'700'}}>{c.note}</Txt><Txt style={[styles.muted,{marginTop:8}]}>{c.privateHint}</Txt>
      <TextInput accessibilityLabel={c.note} value={draft} onChangeText={setDraft} editable={!busy} maxLength={1200} multiline style={[styles.input,{marginTop:12,minHeight:120,textAlign:rtl?'right':'left',textAlignVertical:'top'}]}/>
      <Touch accessibilityRole="checkbox" accessibilityLabel={c.ai} aria-checked={reportDraft.aiConsent} accessibilityState={{checked:reportDraft.aiConsent}} disabled={busy} onPress={()=>setReportDraft({...reportDraft,aiConsent:!reportDraft.aiConsent})} style={{marginTop:20}}><Row><Icon name={reportDraft.aiConsent?'checkbox':'square-outline'} color={colors.primary} size={24}/><Txt style={{flex:1}}>{c.ai}</Txt></Row></Touch>
      <Txt style={[styles.muted,{marginTop:12}]}>{c.aiLimit}</Txt><Txt style={[styles.muted,{marginTop:12}]}>{c.saved}</Txt>
    </>}
    <Button title={c.back} secondary disabled={busy} onPress={()=>step?setStep(step-1):setView('feed')}/>
    {step<2?<Button title={c.next} disabled={busy||!(step===0?reportDraft.channel:reportDraft.request)} onPress={()=>setStep(step+1)}/>:<Button title={session?c.prepare:c.signin} disabled={busy||!reportDraft.channel||!reportDraft.request||!reportDraft.outcome||reportDraft.needsHelp===null} onPress={()=>act('prepare',{...reportDraft,privateNote:draft})}/>}
  </View>}
  {publicPreview&&<View style={styles.card}><Txt style={styles.sectionTitle}>{c.preview}</Txt><Txt>{preview.summary[locale]}</Txt><Txt style={[styles.muted,{marginTop:16}]}>{c.previewHelp}</Txt>
    {(preview.checks?.personal||preview.checks?.harmful||['hold','unavailable'].includes(preview.ai||''))&&<Txt style={[styles.muted,{marginTop:16}]}>{c.noteHeld}</Txt>}
    <Touch accessibilityRole="checkbox" accessibilityLabel={c.consent} aria-checked={consent} accessibilityState={{checked:consent}} disabled={busy} onPress={()=>setConsent(!consent)} style={{marginTop:20}}><Row><Icon name={consent?'checkbox':'square-outline'} color={colors.primary} size={24}/><Txt style={{flex:1}}>{c.consent}</Txt></Row></Touch>
    <Button title={c.publish} disabled={busy||!consent} onPress={()=>act('publish',{id:preview.id,consent})}/><Button title={c.edit} secondary disabled={busy} onPress={()=>{setConsent(false);setView('form');setStep(0);}}/>
  </View>}
  {view==='mine'&&!session&&<Button title={c.login} onPress={signin}/>}
  {(view==='feed'||(view==='mine'&&session))&&<>
    <Button title={c.refresh} secondary disabled={busy} onPress={()=>void load()}/>
    {!busy&&visibleItems.length===0&&<Txt style={[styles.muted,{marginTop:16}]}>{view==='mine'?c.noMine:c.empty}</Txt>}
    {visibleItems.map(item=><View key={item.id} style={styles.card}>
      <Txt>{item.summary[locale]}</Txt><Txt style={[styles.muted,{marginTop:12}]}>{new Date(item.createdAt).toLocaleString(locale)}</Txt>
      {view==='mine'?<>
        <Txt style={[styles.sectionTitle,{marginTop:16}]}>{c.status}: {c.statuses[item.status as keyof typeof c.statuses]||item.status}</Txt>
        <Txt>{c.reasons[item.reason as keyof typeof c.reasons]||c.noteHeld}</Txt>
        <Details><Txt style={styles.sectionTitle}>{c.private}</Txt><Txt>{item.privateNote||'—'}</Txt><Txt>{c.helpQuestion} {item.needsHelp?c.yes:c.no}</Txt></Details>
        {item.needsHelp&&<><Txt style={[styles.muted,{marginTop:12}]}>{c.helpNote}</Txt><Button title={c.help} secondary onPress={()=>router.push('/recovery')}/></>}
        {item.status==='draft'&&<Button title={c.preview} secondary disabled={busy} onPress={()=>{setPreview(item);setPreviewOwner(session!.token);setConsent(false);setView('preview');}}/>}
        {item.status!=='withdrawn'&&item.status!=='checking'&&<SupportHandoff key={`${item.id}:${session?.token}`} summary={item.summary[locale]} handoff={item.handoff} busy={busy} onAction={body=>act('handoff',{id:item.id,...body})}/>}
        {item.status!=='withdrawn'&&<Button title={c.withdraw} secondary disabled={busy} onPress={()=>act('withdraw',{id:item.id})}/>}
      </>:<><Button title={c.flag} secondary disabled={busy} onPress={()=>setFlag(flag===item.id?'':item.id)}/>{flag===item.id&&<>{Object.entries(c.flagReasons).map(([reason,label])=><Button key={reason} title={label} secondary disabled={busy} onPress={()=>act('flag',{id:item.id,reason})}/>)}<Button title={c.cancel} secondary onPress={()=>setFlag('')}/></>}</>}
    </View>)}
  </>}
  {busy&&<ActivityIndicator style={{marginTop:20}} color={colors.primary}/>}
  {!!error&&<Txt accessibilityRole="alert" style={styles.error}>{c.errors[error as keyof typeof c.errors]||c.error}</Txt>}
  {!!notice&&<Txt accessibilityRole="alert" style={{marginTop:20}}>{notice}</Txt>}
  <Details><Txt>{c.demoInfo}</Txt><Txt style={{marginTop:16}}>{c.aiLimit}</Txt></Details>
 </Screen>;
}
