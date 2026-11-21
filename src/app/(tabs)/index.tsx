import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, Platform, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { router, useFocusEffect } from 'expo-router';
import { Touch, Icon, Button, Details, Row, Screen, Txt, useTheme } from '../../components/ui';
import { pickerOptions, resizedWidth, type Photo } from '../../lib/screenshot';
import { useApp } from '../../lib/state';
import { requestAssessment, requestExtraction } from '../../lib/api';
import { samples } from '../../lib/copy';
import { featureCopy } from '../../lib/features';
import { flowCopy, relevantQuestions, type CheckContext, type ContextAnswer } from '../../lib/checkFlow';

type Mode = 'screenshot' | 'message' | 'link';
type Step = 'choose' | 'photo' | 'review' | 'context' | 'confirm';

export default function CheckScreen() {
  const { colors, styles } = useTheme();
  const { t, locale, rtl, setResult } = useApp();
  const f = featureCopy[locale], g = flowCopy[locale];
  const [mode, setMode] = useState<Mode>('screenshot');
  const [step, setStep] = useState<Step>('choose');
  const [text, setText] = useState(''), [sender, setSender] = useState('');
  const [photo, setPhoto] = useState<Photo | null>(null), [prepared, setPrepared] = useState<string | null>(null);
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
    setPhoto(null); setPrepared(null); setHasRead(false); setText(''); setSender('');
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
    if (step === 'confirm') { if (questions.length) { setQuestionIndex(questions.length - 1); setStep('context'); } else setStep('review'); }
    else if (step === 'context') { if (questionIndex > 0) setQuestionIndex(questionIndex - 1); else setStep('review'); }
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

  async function pickImage(crop = false) {
    if (picking || busy) return;
    const version = ++pickerVersion.current;
    setError(''); setPicking(true);
    try {
      const picked = await ImagePicker.launchImageLibraryAsync(pickerOptions(crop, Platform.OS));
      if (picked.canceled || version !== pickerVersion.current) return;
      const asset = picked.assets[0], context = ImageManipulator.manipulate(asset.uri);
      const width = resizedWidth(asset.width, asset.height);
      if (width) context.resize({ width });
      const rendered = await context.renderAsync();
      const image = await rendered.saveAsync({ format: SaveFormat.PNG, base64: true });
      if (version !== pickerVersion.current) return;
      if (!image.base64 || image.base64.length > 7_000_000) { setError(t.imageLarge); return; }
      clearDraft(); setMode('screenshot');
      setPhoto({ uri: image.uri, width: image.width, height: image.height });
      setPrepared('data:image/png;base64,' + image.base64); setStep('photo');
    } catch { if (version === pickerVersion.current) setError(t.imageError); }
    finally { if (version === pickerVersion.current) setPicking(false); }
  }
  function nextReview() {
    if (!text.trim()) { setError(t.required); return; }
    setError(''); setConsent(false); setQuestionIndex(0);
    setStep(questions.length ? 'context' : 'confirm');
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
    if (extracting && hasRead) { setConsent(false); setStep('review'); return; }
    if (!extracting && step !== 'confirm') return;
    if (!(extracting ? prepared : text.trim())) { setError(t.required); return; }
    if (!consent) { setError(t.consentRequired); return; }
    setBusy(true); setError(''); setResult(null);
    const id = ++requestId.current, abort = new AbortController(); controller.current = abort;
    const timer = setTimeout(() => abort.abort('timeout'), 55_000);
    try {
      if (extracting) {
        const extracted = await requestExtraction({ text: '', sender: '', image: prepared, prepared: true, locale, consent }, abort.signal);
        if (id !== requestId.current) return;
        setText(extracted.text); setSender(extracted.sender); setHasRead(true);
        setWarnings(extracted.status === 'unclear' ? [f.unclear, ...extracted.warnings] : extracted.warnings);
        invalidateReview(); setStep('review');
      } else {
        const context: CheckContext = {};
        for (const key of questions) if (answers[key]) context[key] = answers[key];
        const result = await requestAssessment({ text, sender, image: null, locale, consent, context,
          source: mode === 'screenshot' ? 'reviewed_screenshot' : 'text', reviewConfirmed: mode === 'screenshot' && hasRead }, abort.signal);
        if (id !== requestId.current) return;
        setResult(result); clearDraft(); setStep('choose'); setMode('screenshot'); router.push('/result');
      }
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
  return <Screen key={step + ':' + questionIndex}>
    {step !== 'choose' && <Button title={g.back} secondary icon={rtl ? 'arrow-forward' : 'arrow-back'} onPress={back} disabled={picking} />}
    <Txt accessibilityLiveRegion="polite" style={[styles.heading, { marginTop: step === 'choose' ? 0 : 20 }]}>{heading}</Txt>
    {step === 'choose' && <>
      <Txt style={[styles.muted, { marginTop: 12 }]}>{t.subtitle}</Txt>
      <Touch accessibilityRole="button" accessibilityLabel={picking ? f.loadingPhoto : t.upload} disabled={picking} accessibilityState={{ disabled: picking }}
        onPress={() => pickImage()} style={{ marginTop: 24, backgroundColor: colors.upload, borderRadius: 24, borderWidth: 2, borderColor: colors.accentBorder, padding: 24, minHeight: 200, alignItems: 'center', gap: 16 }}>
        <View style={{ padding: 20, borderRadius: 24, backgroundColor: colors.accentSolid }}><Icon name="images-outline" size={48} color={colors.onAccent} /></View>
        <Txt style={{ fontSize: 22, fontWeight: '700', textAlign: 'center', color: colors.primary }}>{picking ? f.loadingPhoto : t.upload}</Txt>
      </Touch>
      {Platform.OS !== 'web' && <Button title={f.chooseCrop} secondary icon="crop-outline" onPress={() => pickImage(true)} disabled={picking} />}
      {photo && <Button title={g.continuePhoto} secondary onPress={() => { setConsent(false); setStep('photo'); }} disabled={picking} />}
      <Button title={g.pasteMessage} icon="chatbubble-outline" secondary onPress={() => chooseText('message')} disabled={picking} />
      <Button title={g.pasteLink} icon="link-outline" secondary onPress={() => chooseText('link')} disabled={picking} />
      <Txt style={[styles.muted, { marginTop: 16 }]}>{t.privacySmall}</Txt>
      <Button title={f.recovery} secondary icon="help-buoy-outline" onPress={() => router.push('/recovery')} disabled={picking} />
      <Details><Txt style={styles.sectionTitle}>{g.practice}</Txt>
        {[t.delivery, t.bank, t.everyday].map((label, i) => <Button key={label} title={label} secondary disabled={picking} onPress={() => {
          clearDraft(); setMode('message'); setText(samples[locale][i]); setSample(true); setStep('review');
        }} />)}
      </Details>
    </>}
    {step === 'photo' && photo && <View style={styles.card}>
      <Image source={{ uri: photo.uri }} style={{ width: '100%', height: 240, backgroundColor: colors.subtle, borderRadius: 16 }} resizeMode="contain" accessibilityLabel={f.prepared} />
      <Txt style={[styles.muted, { marginTop: 16 }]}>{f.cropOptional}</Txt>
      <Button title={t.replace} secondary onPress={() => pickImage()} disabled={busy || picking} />
      {Platform.OS !== 'web' && <Button title={f.chooseCrop} secondary icon="crop-outline" onPress={() => pickImage(true)} disabled={busy || picking} />}
      <Button title={t.remove} secondary onPress={() => { clearDraft(); setStep('choose'); }} disabled={busy || picking} />
      {hasRead ? <Txt style={[styles.muted, { marginTop: 16 }]}>{g.photoRead}</Txt> : <>
        <Txt style={[styles.muted, { marginTop: 16 }]}>{t.privacySmall}</Txt>
        {consentControl(f.extractConsent)}
      </>}
      {!busy && <Button title={hasRead ? g.next : f.extract} icon="arrow-forward-outline" onPress={submit} disabled={picking} />}
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
    {!!error && <View accessibilityRole="alert" style={styles.error}><Txt style={{ color: colors.red }}>{error}</Txt></View>}
    {busy && <View style={{ alignItems: 'center', paddingTop: 24 }}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Txt accessibilityLiveRegion="polite" style={{ marginTop: 12 }}>{step === 'photo' ? f.reading : t.analyzing}</Txt>
      <Button title={t.cancel} secondary onPress={cancel} />
    </View>}
  </Screen>;
}
