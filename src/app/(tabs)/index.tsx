import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { router } from 'expo-router';
import { Button, Row, Screen, Txt, useTheme } from '../../components/ui';
import { pickerOptions, resizedWidth, type Photo } from '../../lib/screenshot';
import { useApp } from '../../lib/state';
import { requestAssessment, requestExtraction } from '../../lib/api';
import { samples } from '../../lib/copy';
import { featureCopy } from '../../lib/features';

type Mode = 'screenshot' | 'message' | 'link';
export default function CheckScreen() {
 const { colors, styles } = useTheme(); const { t, locale, rtl, setResult } = useApp(); const f=featureCopy[locale];
 const [mode,setMode]=useState<Mode>('screenshot'),[text,setText]=useState(''),[sender,setSender]=useState('');
 const [photo,setPhoto]=useState<Photo|null>(null),[prepared,setPrepared]=useState<string|null>(null);
 const [stage,setStage]=useState<'edit'|'prepared'|'review'>('edit'),[warnings,setWarnings]=useState<string[]>([]);
 const [consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[picking,setPicking]=useState(false),[error,setError]=useState(''),[sample,setSample]=useState(false);
 const controller=useRef<AbortController|null>(null),requestId=useRef(0);
 useEffect(()=>()=>{requestId.current++;controller.current?.abort();},[]);
 function clearImage(){setPhoto(null);setPrepared(null);setStage('edit');setWarnings([]);setConsent(false);}
 async function pickImage(crop = false){
  setError('');setPicking(true);
  try {
   const picked=await ImagePicker.launchImageLibraryAsync(pickerOptions(crop,Platform.OS));
   if(picked.canceled)return;
   const asset=picked.assets[0],context=ImageManipulator.manipulate(asset.uri);
   const width=resizedWidth(asset.width,asset.height);
   if(width)context.resize({width});
   const rendered=await context.renderAsync(); const image=await rendered.saveAsync({format:SaveFormat.PNG,base64:true});
   if(!image.base64||image.base64.length>7_000_000){setError(t.imageLarge);return;}
   clearImage();setPhoto({uri:image.uri,width:image.width,height:image.height});setPrepared('data:image/png;base64,'+image.base64);setStage('prepared');setText('');setSender('');setSample(false);
  }catch{setError(t.imageError);}finally{setPicking(false);}
 }
 async function submit(){
  if(busy || (mode==='screenshot'&&stage==='edit'))return;
  const extracting=mode==='screenshot'&&stage==='prepared';
  if(!(extracting?prepared:text.trim())){setError(t.required);return;}
  if(!consent){setError(t.consentRequired);return;}
  setBusy(true);setError('');setResult(null);
  const id=++requestId.current,abort=new AbortController();controller.current=abort;
  const timer=setTimeout(()=>abort.abort('timeout'),55_000);
  try{
   if(extracting){
    const result=await requestExtraction({text:'',sender:'',image:prepared,prepared:true,locale,consent},abort.signal);
    if(id!==requestId.current)return;
    setText(result.text);setSender(result.sender);setWarnings(result.status==='unclear'?[f.unclear,...result.warnings]:result.warnings);
    setStage('review');setConsent(false);setPrepared(null);return;
   }
   const result=await requestAssessment({text,sender,image:null,locale,consent,source:mode==='screenshot'?'reviewed_screenshot':'text',reviewConfirmed:mode==='screenshot'&&stage==='review'&&consent},abort.signal);
   if(id!==requestId.current)return;
   setResult(result);clearImage();setText('');setSender('');setSample(false);router.push('/result');
  }catch(err){
   if(id!==requestId.current)return;
   if(abort.signal.aborted)setError(t.errors.AI_TIMEOUT);
   else{const code=(err as Error).message as keyof typeof t.errors;setError(t.errors[code]||t.errors.DEFAULT);}
  }finally{clearTimeout(timer);if(id===requestId.current)setBusy(false);}
 }
 function cancel(){requestId.current++;controller.current?.abort();setBusy(false);}
 const editable=mode!=='screenshot'||stage==='review';
 const direction={textAlign:rtl&&mode!=='link'?'right' as const:'left' as const,writingDirection:rtl&&mode!=='link'?'rtl' as const:'ltr' as const};
 return <Screen>
  <Txt style={styles.eyebrow}>{t.eyebrow}</Txt><Txt style={styles.heading}>{t.title}</Txt><Txt style={[styles.muted,{marginTop:14}]}>{t.subtitle}</Txt>
  <View style={styles.card}>
   <Txt style={styles.sectionTitle}>{t.checkTitle}</Txt>
   <Row style={{backgroundColor:colors.subtle,borderRadius:13,padding:4,gap:3}}>
    {(['screenshot','message','link'] as Mode[]).map(item=><Pressable key={item} accessibilityRole="tab" aria-selected={mode===item} accessibilityState={{selected:mode===item}} disabled={busy||picking} onPress={()=>{setMode(item);setError('');setConsent(false);}} style={{flex:1,paddingVertical:11,backgroundColor:mode===item?colors.surface:'transparent',borderRadius:10}}>
     <Txt style={{textAlign:'center',fontSize:12,fontWeight:'700',color:mode===item?colors.teal:colors.muted}}>{t[item]}</Txt>
    </Pressable>)}
   </Row>
   <View style={{marginTop:18}}>
    {mode==='screenshot'&&photo&&stage==='prepared'&&<View>
     <Txt style={styles.sectionTitle}>{f.prepared}</Txt>
     <Image source={{uri:photo.uri}} style={{width:'100%',height:260,backgroundColor:colors.subtle,borderRadius:14}} resizeMode="contain" accessibilityLabel={f.prepared}/>
     <Txt style={[styles.muted,{fontSize:12,marginTop:10}]}>{f.cropOptional}</Txt>
    </View>}
    {mode==='screenshot'&&!photo&&<Button title={picking?f.loadingPhoto:t.upload} icon="image-outline" disabled={busy||picking} onPress={()=>pickImage()}/>}
    {mode==='screenshot'&&Platform.OS!=='web'&&<Button title={f.chooseCrop} secondary icon="crop-outline" disabled={busy||picking} onPress={()=>pickImage(true)}/>}
    {mode==='screenshot'&&photo&&<Row style={{marginTop:14,justifyContent:'space-between'}}>
     <Pressable accessibilityRole="button" disabled={busy||picking} onPress={()=>pickImage()}><Txt style={{color:colors.teal}}>{t.replace}</Txt></Pressable>
     <Pressable accessibilityRole="button" disabled={busy||picking} onPress={()=>{clearImage();setText('');setSender('');}}><Txt>{t.remove}</Txt></Pressable>
    </Row>}
    {mode==='screenshot'&&stage==='review'&&<View><Txt style={[styles.sectionTitle,{marginTop:18}]}>{f.review}</Txt><Txt style={styles.muted}>{f.reviewHelp}</Txt>{warnings.map((line,i)=><Txt key={i} style={styles.error}>{line}</Txt>)}</View>}
    {editable&&<TextInput accessibilityLabel={mode==='link'?t.link:t.message} style={[styles.input,direction,{minHeight:150,textAlignVertical:'top',marginTop:12}]} placeholder={mode==='link'?t.linkPlaceholder:t.messagePlaceholder} placeholderTextColor={colors.placeholder} multiline value={text} maxLength={12000} autoCapitalize="none" autoCorrect={false} editable={!busy} onChangeText={value=>{setText(value);setSample(false);setConsent(false);}}/>}
   </View>
   {mode!=='link'&&editable&&<TextInput accessibilityLabel={t.sender} style={[styles.input,{marginTop:14,textAlign:rtl?'right':'left'}]} placeholder={t.sender} placeholderTextColor={colors.placeholder} value={sender} onChangeText={value=>{setSender(value);setConsent(false);}} maxLength={150} editable={!busy}/>}
   {sample&&mode==='message'&&<Txt style={{fontSize:11,color:colors.teal,marginTop:8}}>{t.sampleNote}</Txt>}
   {(mode!=='screenshot'||stage!=='edit')&&<Pressable accessibilityRole="checkbox" aria-checked={consent} accessibilityState={{checked:consent}} onPress={()=>setConsent(!consent)} disabled={busy} style={{marginTop:20}}>
    <Row style={{alignItems:'flex-start',gap:10}}><Ionicons name={consent?'checkbox':'square-outline'} size={24} color={consent?colors.teal:colors.placeholder}/><Txt style={{flex:1,fontSize:12,lineHeight:19,color:colors.muted}}>{mode==='screenshot'?stage==='review'?f.reviewed:f.extractConsent:t.privacy}</Txt></Row>
   </Pressable>}
   {!!error&&<View accessibilityRole="alert" style={styles.error}><Txt style={{color:colors.red,fontSize:13}}>{error}</Txt></View>}
   {busy?<View style={{alignItems:'center',paddingTop:24}}><ActivityIndicator color={colors.teal} size="large"/><Txt style={{fontWeight:'700',marginTop:12}}>{mode==='screenshot'&&stage==='prepared'?f.reading:t.analyzing}</Txt><Button title={t.cancel} secondary onPress={cancel}/></View>:<Button title={mode==='screenshot'&&stage==='prepared'?f.extract:t.analyze} icon="shield-checkmark-outline" onPress={submit} disabled={picking||(mode==='screenshot'&&stage==='edit')}/>}
   <Txt style={{color:colors.muted,fontSize:11,lineHeight:17,marginTop:14}}>{t.privacySmall}</Txt>
  </View>
  <Button title={f.recovery} secondary icon="help-buoy-outline" onPress={()=>{cancel();router.push('/recovery');}}/>
  <Txt style={{marginTop:24,fontSize:12,fontWeight:'600',color:colors.muted}}>{t.sample}</Txt>
  <Row style={{gap:8,marginTop:10,flexWrap:'wrap'}}>{[t.delivery,t.bank,t.everyday].map((label,i)=><Pressable accessibilityRole="button" key={i} disabled={busy||picking} onPress={()=>{setMode('message');setText(samples[locale][i]);setSender('');clearImage();setSample(true);setError('');}} style={{borderWidth:1,borderColor:colors.line,backgroundColor:colors.surface,borderRadius:20,paddingHorizontal:12,paddingVertical:7}}><Txt style={{fontSize:11,color:colors.teal}}>{label}</Txt></Pressable>)}</Row>
  <LinearGradient colors={[colors.tipStart,colors.tipEnd]} style={{borderRadius:21,padding:22,marginTop:28}}>
   <Txt style={styles.eyebrow}>{t.tip}</Txt><Txt style={{fontSize:20,fontWeight:'700',marginBottom:7}}>{t.tipTitle}</Txt><Txt style={{fontSize:13,lineHeight:21,color:colors.tipText}}>{t.tipBody}</Txt>
  </LinearGradient>
 </Screen>;
}
