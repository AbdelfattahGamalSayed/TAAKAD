import { Touch as Pressable , Icon as Ionicons , Button, Row, Screen, Txt, useTheme } from '../../components/ui';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../lib/state';
import { Category, forumCopy, samplePosts } from '../../lib/community';
import { router } from 'expo-router';
import { authCopy, authRequest, useAuth } from '../../lib/auth';

export default function CommunityScreen() {
 const { colors, styles } = useTheme();
 const { locale, rtl } = useApp();
 const f = forumCopy[locale];
 const a=authCopy[locale],{session,setSession,draft,setDraft,welcome}=useAuth();
 const [preview,setPreview]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submitPreview(){
  if(busy)return;
  if(!session||session.expiresAt<=Date.now()){setSession(null);welcome();router.push('/signin');return;}
  setBusy(true);setError('');
  try{await authRequest('/api/community/preview',{action:'preview'},session.token);setPreview(true);}
  catch(err){const code=(err as Error).message;if(code==='AUTH_REQUIRED')setSession(null);setError(code);}
  finally{setBusy(false);}
 }
 const [category,setCategory] = useState<Category>('all');
 const [query,setQuery] = useState('');
 const [expanded,setExpanded] = useState<string|null>(null);
 const [helpful,setHelpful] = useState<string[]>([]);
 const [posting,setPosting] = useState(false);
 const posts = samplePosts.filter(p => (category === 'all' || p.category === category) && (p[locale].title+' '+p[locale].body).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 return <Screen>
  <Txt style={styles.heading}>{f.title}</Txt><Txt style={[styles.muted,{marginTop:12}]}>{f.subtitle}</Txt>
  <View style={[styles.card,{backgroundColor:colors.primarySoft,borderColor:colors.accentBorder,marginTop:20}]}><Row style={{alignItems:'flex-start',gap:10}}><Ionicons name="flask-outline" size={21} color={colors.primary}/><View style={{flex:1}}><Txt style={{fontWeight:'700',color:colors.primary}}>{f.preview}</Txt><Txt style={[styles.muted,{marginTop:5,fontSize:16,lineHeight:24}]}>{f.notice}</Txt></View></Row></View>
  <Button title={f.start} icon="add-circle-outline" onPress={()=>setPosting(!posting)}/>
  {(posting||!!draft)&&<View style={styles.card}><Txt style={styles.sectionTitle}>{a.draftTitle}</Txt><Txt style={styles.muted}>{a.draftHint}</Txt>
    <Txt style={{marginTop:16}}>{a.draftLabel}</Txt><TextInput accessibilityLabel={a.draftLabel} value={draft} onChangeText={text=>{setDraft(text);setPreview(false);setError('');}} editable={!busy} multiline maxLength={1600} style={[styles.input,{minHeight:140,marginTop:12,textAlign:rtl?'right':'left',textAlignVertical:'top'}]}/>
    <Txt style={[styles.muted,{marginTop:16}]}>{a.previewNote}</Txt><Txt style={[styles.muted,{marginTop:12}]}>{a.draftSaved}</Txt>
    {session&&<Txt style={{marginTop:16}}>{a.session}</Txt>}
    <Button title={session?a.preview:a.loginPost} disabled={busy||!draft.trim()} icon="lock-closed-outline" onPress={submitPreview}/>
    {preview&&<Txt accessibilityRole="alert" style={{marginTop:16}}>{a.previewDone}</Txt>}
    {!!error&&<Txt accessibilityRole="alert" style={styles.error}>{a.errors[error as keyof typeof a.errors]||a.errors.NETWORK}</Txt>}
    <Button title={a.clear} secondary disabled={busy} onPress={()=>{setDraft('');setPosting(false);setPreview(false);setError('');}}/>
  </View>}
  <Row style={{...styles.input,marginTop:24,gap:9}}><Ionicons name="search-outline" size={20} color={colors.muted}/><TextInput accessibilityLabel={f.search} placeholder={f.search} placeholderTextColor={colors.placeholder} value={query} onChangeText={setQuery} maxLength={100} style={{flex:1,color:colors.text,minHeight:48,fontSize:16,textAlign:rtl?'right':'left',writingDirection:rtl?'rtl':'ltr'}}/></Row>
  <Row style={{flexWrap:'wrap',gap:8,marginTop:14}}>{(['all','messages','links','accounts'] as Category[]).map(value=><Pressable accessibilityRole="radio" accessibilityState={{selected:category===value}} key={value} onPress={()=>setCategory(value)} style={{paddingHorizontal:13,paddingVertical:10,borderRadius:22,borderWidth:1,borderColor:category===value?colors.primary:colors.line,backgroundColor:category===value?colors.primarySoft:colors.surface}}><Txt style={{fontSize:16,fontWeight:'600',color:category===value?colors.primary:colors.muted}}>{f[value]}</Txt></Pressable>)}</Row>
  {posts.length===0 && <View style={styles.card}><Txt style={styles.sectionTitle}>{f.empty}</Txt><Button title={f.reset} secondary onPress={()=>{setQuery('');setCategory('all');}}/></View>}
  {posts.map(post=>{
   const content=post[locale], open=expanded===post.id, marked=helpful.includes(post.id);
   return <View key={post.id} style={styles.card}>
    <Row style={{alignItems:'flex-start',marginBottom:15}}><View style={{width:40,height:40,borderRadius:14,backgroundColor:colors.subtle,alignItems:'center',justifyContent:'center'}}><Txt style={{fontWeight:'800',color:colors.primary}}>{post.author[locale][0]}</Txt></View><View style={{flex:1}}><Txt style={{fontWeight:'700',fontSize:16}}>{post.author[locale]} · {f.member}</Txt><Txt style={{color:colors.muted,fontSize:16}}>{f.example}</Txt></View><View style={{borderRadius:10,paddingHorizontal:8,paddingVertical:4,backgroundColor:colors.primarySoft}}><Txt style={{fontSize:16,color:colors.primary}}>{f[post.category]}</Txt></View></Row>
    <Txt style={{fontSize:20,lineHeight:28,fontWeight:'700',marginBottom:10}}>{content.title}</Txt><Txt style={[styles.muted,{fontSize:16}]}>{content.body}</Txt>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setExpanded(open?null:post.id)} style={{paddingVertical:15,marginTop:8}}><Row style={{justifyContent:'space-between'}}><Row style={{gap:7}}><Ionicons name="chatbubbles-outline" size={18} color={colors.primary}/><Txt style={{color:colors.primary,fontSize:16,fontWeight:'700'}}>{open?f.hide:f.read} · {content.replies.length}</Txt></Row><Ionicons name={open?'chevron-up':'chevron-down'} color={colors.primary} size={17}/></Row></Pressable>
    {open && <View style={{borderTopWidth:1,borderTopColor:colors.line,paddingTop:16}}><Txt style={{fontWeight:'700',fontSize:16,marginBottom:12}}>{f.replies}</Txt>{content.replies.map((reply,index)=><View key={index} style={{backgroundColor:colors.input,borderRadius:14,padding:14,marginBottom:10}}><Txt style={{fontSize:16,color:colors.primary,fontWeight:'700',marginBottom:5}}>{f.member} {index+1}</Txt><Txt style={{fontSize:16,lineHeight:24}}>{reply}</Txt></View>)}<Pressable accessibilityRole="button" accessibilityState={{selected:marked}} onPress={()=>setHelpful(current=>marked?current.filter(id=>id!==post.id):[...current,post.id])} style={{alignSelf:rtl?'flex-end':'flex-start',paddingVertical:10}}><Row style={{gap:7}}><Ionicons name={marked?'heart':'heart-outline'} size={18} color={colors.primary}/><Txt style={{color:colors.primary,fontSize:16}}>{marked?f.marked:f.helpful}</Txt></Row></Pressable></View>}
   </View>;
  })}
  <LinearGradient colors={[colors.tipStart,colors.tipEnd]} style={{padding:22,borderRadius:22,marginTop:24}}><Row style={{gap:9,marginBottom:9}}><Ionicons name="shield-checkmark-outline" color={colors.primary} size={22}/><Txt style={{fontSize:16,fontWeight:'700',flex:1}}>{f.guide}</Txt></Row><Txt style={{color:colors.tipText,fontSize:16,lineHeight:24}}>{f.guideBody}</Txt></LinearGradient>
  <Txt style={{marginTop:20,color:colors.muted,fontSize:16,lineHeight:24,textAlign:'center'}}>{f.footer}</Txt>
 </Screen>;
}
