import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Welcome } from '../../components/welcome';
import { useAuth } from '../../lib/auth';
import { ActivityIndicator, BackHandler, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { router, useFocusEffect } from 'expo-router';
import { Touch, Icon, Button, Details, Row, Screen, Txt, useTheme } from '../../components/ui';
import { pickerOptions, resizedWidth, cropPixels, WHOLE_PHOTO, type CropRect, type Photo } from '../../lib/screenshot';
import {PhotoCrop} from '../../components/photo-crop';
import {cropCopy} from '../../lib/cropCopy';
import { useApp } from '../../lib/state';
import { requestAssessment, requestExtraction } from '../../lib/api';
import { samples } from '../../lib/copy';
import { featureCopy } from '../../lib/features';
import { flowCopy, relevantQuestions, type CheckContext, type ContextAnswer } from '../../lib/checkFlow';

type Mode = 'screenshot' | 'message' | 'link';
type Step = 'choose' | 'photo' | 'review' | 'context' | 'confirm';

export default function CheckScreen() {
  const {welcomed}=useAuth();
  const { colors, styles } = useTheme();
  const { t, locale, rtl, setResult } = useApp();
  const f = featureCopy[locale], g = flowCopy[locale];
  const [mode, setMode] = useState<Mode>('screenshot');
  const [step, setStep] = useState<Step>('choose');
  const [text, setText] = useState(''), [sender, setSender] = useState('');
  const [photo, setPhoto] = useState<Photo | null>(null), [prepared, setPrepared] = useState<string | null>(null);
  const [crop,setCrop]=useState<CropRect>({...WHOLE_PHOTO});
  const [hasRead, setHasRead] = useState(false), [warnings, setWarnings] = useState<string[]>([]);
  const [answers, setAnswers] = useState<CheckContext>({}), [questionIndex, setQuestionIndex] = useState(0);
  const [consent, setConsent] = useState(false), [busy, setBusy] = useState(false), [picking, setPicking] = useState(false);
  const [error, setError] = useState(''), [sample, setSample] = useState(false);
  const controller = useRef<AbortController | null>(null), requestId = useRef(0), pickerVersion = useRef(0);
  const questions = relevantQuestions(text);
  const question = questions[questionIndex];
  const cancel = useCallback(() => {
    requestId.current++; controller.current?.abort(); controller.current = null; setBusy(false);
  }, []);
  useFocusEffect(useCallback(() => () => { cancel(); pickerVersion.current++; setPicking(false); }, [cancel]));
  useEffect(() => () => { cancel(); setConsent(false); setError(''); }, [locale, cancel]);

  function invalidateReview() { setConsent(false); setAnswers({}); setQuestionIndex(0); setError(''); }
  function clearDraft() {
    setPhoto(null); setCrop({...WHOLE_PHOTO}); setPrepared(null); setHasRead(false); setText(''); setSender('');
    setWarnings([]); setSample(false); invalidateReview();
  }
  function chooseText(nextMode: 'message' | 'link') {
    if (mode !== nextMode) clearDraft();
    setMode(nextMode); setConsent(false); setError(''); setStep('review');
  }
  function back() {
    if (busy) { cancel(); return; }
    if (picking) return;
    setConsent(false); setError('');
    if (step === 'confirm') { if (questions.length) { setQuestionIndex(questions.length - 1); setStep('context'); } else setStep(mode === 'screenshot' ? 'photo' : 'review'); }
    else if (step === 'context') { if (questionIndex > 0) setQuestionIndex(questionIndex - 1); else setStep(mode === 'screenshot' ? 'photo' : 'review'); }
    else if (step === 'review') setStep(mode === 'screenshot' && photo ? 'photo' : 'choose');
    else setStep('choose');
  }
  const backRef = useRef(back);
  useEffect(() => { backRef.current = back; });
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 'choose' && !busy && !picking) return false;
      backRef.current(); return true;
    });
    return () => subscription.remove();
  }, [step, busy, picking]));

  async function pickImage() {
    if (picking || busy) return;
    const version = ++pickerVersion.current;
    setError(''); setPicking(true);
    try {
      const picked = await ImagePicker.launchImageLibraryAsync(pickerOptions());
      if (picked.canceled || version !== pickerVersion.current) return;
      const asset = picked.assets[0];resizedWidth(asset.width,asset.height);
      clearDraft(); setMode('screenshot');
      setPhoto({uri:asset.uri,width:asset.width,height:asset.height});setStep('photo');
    } catch { if (version === pickerVersion.current) setError(t.imageError); }
    finally { if (version === pickerVersion.current) setPicking(false); }
  }
  function nextReview() {
    if (!text.trim()) { setError(t.required); return; }
    setError(''); setConsent(false); setQuestionIndex(0);
    setStep(questions.length ? 'context' : 'confirm');
  }
  async function readPhoto(){
    if(controller.current||!photo)return;
    setBusy(true);setError('');const id=++requestId.current,abort=new AbortController();controller.current=abort;
    const timer=setTimeout(()=>abort.abort(),55000);
    let preparing=true;
    try{
      let image=prepared;
      if(!image){
        const pixels=cropPixels(crop,photo.width,photo.height),context=ImageManipulator.manipulate(photo.uri);
        if(pixels.originX||pixels.originY||pixels.width!==photo.width||pixels.height!==photo.height)context.crop(pixels);
        const width=resizedWidth(pixels.width,pixels.height);if(width)context.resize({width});
        const rendered=await context.renderAsync(),saved=await rendered.saveAsync({format:SaveFormat.PNG,base64:true});
        if(id!==requestId.current)return;
        if(abort.signal.aborted){setError(t.errors.AI_TIMEOUT);return;}
        if(!saved.base64||saved.base64.length>7_000_000){setError(t.imageLarge);return;}
        image='data:image/png;base64,'+saved.base64;setPrepared(image);
      }
      preparing=false;
      const extracted=await requestExtraction({text:'',sender:'',image,prepared:true,locale,consent:true},abort.signal);
      if(id!==requestId.current)return;
      setText(extracted.text);setSender(extracted.sender);setHasRead(true);invalidateReview();
      setWarnings(extracted.status==='unclear'?[f.unclear,...extracted.warnings]:extracted.warnings);
      setStep(extracted.status==='unclear'||!extracted.text.trim()?'review':relevantQuestions(extracted.text).length?'context':'confirm');
    }catch(err){if(id===requestId.current){const code=(err as Error).message as keyof typeof t.errors;setError(abort.signal.aborted?t.errors.AI_TIMEOUT:preparing?t.imageError:t.errors[code]||t.errors.DEFAULT);}}
    finally{clearTimeout(timer);if(id===requestId.current){controller.current=null;setBusy(false);}}
  }
  function nextQuestion(skip = false) {
    if (!question || (!skip && !answers[question])) return;
    if (skip) setAnswers(current => ({ ...current, [question]: 'skipped' }));
    setConsent(false); setError('');
    if (questionIndex + 1 < questions.length) setQuestionIndex(questionIndex + 1);
    else setStep('confirm');
  }
  async function submit() {
    if (controller.current || busy || picking) return;
    const extracting = step === 'photo';
    if (extracting) { if(hasRead){setConsent(false);setStep(questions.length?'context':'confirm');}else await readPhoto();return; }
    if (step !== 'confirm') return;
    if (!text.trim()) { setError(t.required); return; }
    if (!consent) { setError(t.consentRequired); return; }
    setBusy(true); setError(''); setResult(null);
    const id = ++requestId.current, abort = new AbortController(); controller.current = abort;
    const timer = setTimeout(() => abort.abort('timeout'), 55_000);
    try {
        const context: CheckContext = {};
        for (const key of questions) if (answers[key]) context[key] = answers[key];
        const result = await requestAssessment({ text, sender, image: null, locale, consent, context,
          source: mode === 'screenshot' ? 'transcribed_screenshot' : 'text' }, abort.signal);
        if (id !== requestId.current) return;
        setResult(result); clearDraft(); setStep('choose'); setMode('screenshot'); router.push('/result');
    } catch (err) {
      if (id !== requestId.current) return;
      const code = (err as Error).message as keyof typeof t.errors;
      setError(abort.signal.aborted ? t.errors.AI_TIMEOUT : t.errors[code] || t.errors.DEFAULT);
    } finally {
      clearTimeout(timer);
      if (id === requestId.current) { controller.current = null; setBusy(false); }
    }
  }
  const consentControl = (label: string) => <Touch accessibilityRole="checkbox" aria-checked={consent} accessibilityState={{ checked: consent, disabled: busy }}
    disabled={busy} onPress={() => setConsent(value => !value)} style={{ marginTop: 20 }}>
    <Row style={{ alignItems: 'flex-start' }}><Icon name={consent ? 'checkbox' : 'square-outline'} size={26} color={colors.primary} />
      <Txt style={{ flex: 1 }}>{label}</Txt></Row>
  </Touch>;
  const heading = step === 'choose' ? t.title : step === 'photo' ? g.photo : step === 'review' ? g.review : step === 'context' ? g.context : g.confirm;
  if (!welcomed) return <Welcome />;
  return <Screen key={step + ':' + questionIndex}>
    {step !== 'choose' && <Button title={g.back} secondary icon={rtl ? 'arrow-forward' : 'arrow-back'} onPress={back} disabled={picking} />}
    <Txt accessibilityLiveRegion="polite" style={[styles.heading, { marginTop: step === 'choose' ? 0 : 20 }]}>{heading}</Txt>
    {step === 'choose' && <>
      <Txt style={[styles.muted,{marginTop:12,fontSize:16}]}>{locale==='en'?'Photos go to OpenAI only when you tap Scan photo.':'تُرسل الصور إلى OpenAI فقط عند الضغط على فحص الصورة.'}</Txt>
      <Touch accessibilityRole="button" accessibilityLabel={picking ? f.loadingPhoto : t.upload} disabled={picking} accessibilityState={{ disabled: picking }}
        testID="home-screenshot" onPress={() => pickImage()} style={{ marginTop: 20, backgroundColor: colors.upload, borderRadius: 24, padding: 20, minHeight: 166, alignItems: 'center', gap: 12 }}>
        <View style={{ padding: 14 }}><Icon name="images-outline" size={44} color={colors.onUpload} /></View>
        <Txt style={{ fontSize: 22, fontWeight: '700', textAlign: 'center', color: colors.onUpload }}>{picking ? f.loadingPhoto : t.upload}</Txt>
      </Touch>
      <Touch testID="home-paste" accessibilityRole="button" accessibilityLabel={g.pasteMessage} disabled={picking} onPress={()=>chooseText('message')} style={{marginTop:16,backgroundColor:colors.paste,borderRadius:24,padding:20,minHeight:166,alignItems:'center',gap:12}}>
        <View style={{padding:14}}><Icon name="clipboard-outline" size={44} color={colors.onPaste}/></View>
        <Txt style={{fontSize:22,fontWeight:'700',textAlign:'center',color:colors.onPaste}}>{g.pasteMessage}</Txt>
      </Touch>
      <Button title={f.recovery} tone="danger" secondary icon="warning" onPress={() => router.push('/recovery')} disabled={picking} />
      <Details>
        {photo && <Button title={g.continuePhoto} secondary onPress={() => { setConsent(false); setStep('photo'); }} disabled={picking} />}
        <Txt style={styles.sectionTitle}>{g.practice}</Txt>
        {[t.delivery, t.bank, t.everyday].map((label, i) => <Button key={label} title={label} secondary disabled={picking} onPress={() => {
          clearDraft(); setMode('message'); setText(samples[locale][i]); setSample(true); setStep('review');
        }} />)}
      </Details>
    </>}
    {step === 'photo' && photo && <View style={styles.card}>
      <PhotoCrop key={photo.uri} photo={photo} crop={crop} disabled={busy||picking} onChange={value=>{setCrop(value);setPrepared(null);setHasRead(false);setText('');setSender('');setWarnings([]);invalidateReview();}}/>
      <Txt style={[styles.muted,{marginTop:16}]}>{cropCopy[locale].privacy}</Txt>
      {!busy && <Button title={hasRead?g.next:cropCopy[locale].scan} tone="success" icon="scan-outline" onPress={submit} disabled={picking} />}
      <Details>
       <Button title={t.replace} secondary onPress={() => pickImage()} disabled={busy || picking} />
       <Button title={t.remove} secondary onPress={() => { clearDraft(); setStep('choose'); }} disabled={busy || picking} />
      </Details>
    </View>}
    {step === 'review' && <View style={styles.card}>
      <Txt style={styles.muted}>{g.reviewHelp}</Txt>
      {warnings.map((warning, i) => <Txt key={i} style={styles.error}>{warning}</Txt>)}
      <Txt style={{ marginTop: 20, fontWeight: '700' }}>{mode === 'link' ? t.link : t.message}</Txt>
      <TextInput accessibilityLabel={mode === 'link' ? t.link : t.message} style={[styles.input, { marginTop: 8, minHeight: 150, textAlignVertical: 'top', textAlign: rtl && mode !== 'link' ? 'right' : 'left', writingDirection: mode === 'link' ? 'ltr' : rtl ? 'rtl' : 'ltr' }]}
        placeholder={mode === 'link' ? t.linkPlaceholder : t.messagePlaceholder} placeholderTextColor={colors.placeholder} multiline value={text} maxLength={12000}
        autoCapitalize="none" autoCorrect={false} onChangeText={value => { setText(value); setSample(false); invalidateReview(); }} />
      {mode !== 'link' && <>
        <Txt style={{ marginTop: 16, fontWeight: '700' }}>{t.sender}</Txt>
        <TextInput accessibilityLabel={t.sender} style={[styles.input, { marginTop: 8, textAlign: rtl ? 'right' : 'left' }]} value={sender}
          maxLength={150} onChangeText={value => { setSender(value); invalidateReview(); }} />
      </>}
      {sample && <Txt style={[styles.muted, { marginTop: 12 }]}>{t.sampleNote}</Txt>}
      <Button title={g.next} onPress={nextReview} />
    </View>}
    {step === 'context' && question && <View style={styles.card}>
      <Txt style={styles.eyebrow}>{g.question} {questionIndex + 1} {g.of} {questions.length}</Txt>
      <Txt style={styles.sectionTitle}>{g[question]}</Txt>
      <Txt style={styles.muted}>{g.optional}</Txt>
      {(['yes', 'no', 'not_sure'] as ContextAnswer[]).map(value => <Touch key={value} accessibilityRole="radio" accessibilityLabel={g[value]}
        aria-checked={answers[question] === value} accessibilityState={{ checked: answers[question] === value }} onPress={() => {
          setAnswers(current => ({ ...current, [question]: value })); setConsent(false);
        }} style={{ marginTop: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.controlBorder, backgroundColor: answers[question] === value ? colors.primarySoft : colors.surface }}>
        <Row><Icon name={answers[question] === value ? 'radio-button-on' : 'radio-button-off'} color={colors.primary} size={24} /><Txt>{g[value]}</Txt></Row>
      </Touch>)}
      <Button title={g.next} onPress={() => nextQuestion()} disabled={!answers[question]} />
      <Button title={g.skip} secondary onPress={() => nextQuestion(true)} />
    </View>}
    {step === 'confirm' && <View style={styles.card}>
      <Txt style={styles.muted}>{g.confirmHelp}</Txt>
      {mode==='screenshot'&&<Txt style={[styles.muted,{marginTop:12}]}>{locale==='en'?'Words read from a photo can be wrong. Use Edit the message if anything looks incorrect.':'قد تخطئ قراءة الصورة. استخدم تعديل الرسالة إذا لاحظت خطأ.'}</Txt>}
      <Txt style={[styles.sectionTitle, { marginTop: 20 }]}>{g.message}</Txt>
      <Txt selectable numberOfLines={4} style={{ writingDirection: mode === 'link' ? 'ltr' : rtl ? 'rtl' : 'ltr', textAlign: mode === 'link' ? 'left' : rtl ? 'right' : 'left' }}>{text}</Txt>
      {!!sender && <Txt style={[styles.muted, { marginTop: 12 }]}>{t.sender}: {sender}</Txt>}
      {questions.length > 0 && <View style={{ marginTop: 20 }}>
        <Txt style={styles.sectionTitle}>{g.answers}</Txt>
        {questions.map(key => <View key={key} style={{ marginBottom: 12 }}><Txt>{g[key]}</Txt><Txt style={{ color: colors.primary, fontWeight: '700' }}>{g[answers[key] || 'skipped']}</Txt></View>)}
      </View>}
      <Button title={g.edit} secondary onPress={() => { setConsent(false); setError(''); setStep('review'); }} disabled={busy} />
      {consentControl(g.consent)}
      {!busy && <Button title={t.analyze} icon="shield-checkmark-outline" onPress={submit} />}
      <Txt style={[styles.muted, { marginTop: 16 }]}>{g.confirmLimit}</Txt>
    </View>}
    {!!error && <View accessibilityRole="alert" style={styles.error}><Txt style={{ color: colors.primary }}>{error}</Txt></View>}
    {busy && <View style={{ alignItems: 'center', paddingTop: 24 }}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Txt accessibilityLiveRegion="polite" style={{ marginTop: 12 }}>{step === 'photo' ? f.reading : t.analyzing}</Txt>
      <Button title={t.cancel} secondary onPress={cancel} />
    </View>}
  </Screen>;
}
