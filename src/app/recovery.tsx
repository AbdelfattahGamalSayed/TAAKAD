import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useFocusEffect } from 'expo-router';
import { Touch, Icon, Screen, Txt, Button, Row, useTheme } from '../components/ui';
import { useApp } from '../lib/state';
import { featureCopy, recoverySteps } from '../lib/features';
import { helpSources, recoveryCopy, recoveryQuestions, recoveryTopics, type RecoveryAnswers, type RecoveryAnswer } from '../lib/recovery';

type Stage = 'intro' | 'questions' | 'steps' | 'end';
type Guide = 'whatsapp' | 'apple' | 'google';
export default function RecoveryScreen() {
  const { locale, rtl } = useApp(), { colors, styles } = useTheme();
  const c = recoveryCopy[locale], f = featureCopy[locale];
  const [stage, setStage] = useState<Stage>('intro'), [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<RecoveryAnswers>({}), [done, setDone] = useState<string[]>([]);
  const [panel, setPanel] = useState<'help' | 'guides' | null>(null), [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState('');
  const topics = recoveryTopics(answers), topic = topics[Math.min(index, topics.length - 1)];
  const question = recoveryQuestions[index];
  const uncertain = Object.values(answers).includes('unsure');
  const steps = topic === 'password' || topic === 'otp' ? recoverySteps[locale][topic] : c[topic];
  function exit() { if (router.canGoBack()) router.back(); else router.replace('/'); }
  function back() {
    setError('');
    if (guide) { setGuide(null); return; }
    if (panel) { setPanel(null); return; }
    if (stage === 'intro') { exit(); return; }
    if (stage === 'questions') { if (index) setIndex(index - 1); else setStage('intro'); return; }
    if (stage === 'end') { setStage('steps'); setIndex(topics.length - 1); return; }
    if (index) setIndex(index - 1); else { setStage('questions'); setIndex(recoveryQuestions.length - 1); }
  }
  const backRef = useRef(back);
  useEffect(() => { backRef.current = back; });
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { backRef.current(); return true; });
    return () => subscription.remove();
  }, []));
  function next() {
    if (stage === 'questions') {
      if (!answers[question]) return;
      if (index < recoveryQuestions.length - 1) setIndex(index + 1);
      else { setStage('steps'); setIndex(0); }
    } else if (index < topics.length - 1) setIndex(index + 1);
    else { setStage('end'); setIndex(0); }
  }
  function open(url: string) { setError(''); Linking.openURL(url).catch(() => setError(c.error)); }
  function show(nextPanel: 'help' | 'guides') { setPanel(nextPanel); setGuide(null); setError(''); }
  const title = panel === 'help' ? c.helpTitle : panel === 'guides' ? (guide ? c.guideLabels[guide] : c.guides) : stage === 'intro' ? c.title : stage === 'questions' ? f.recoveryTitle : stage === 'steps' ? c.plan : c.end;
  return <Screen key={`${stage}:${index}:${panel}:${guide}`}>
    <Button title={c.back} secondary icon={rtl ? 'arrow-forward' : 'arrow-back'} onPress={back} />
    <Txt accessibilityLiveRegion="polite" style={[styles.heading, { marginTop: 20 }]}>{title}</Txt>
    {panel === 'help' ? <>
      <Txt style={[styles.muted, { marginTop: 16 }]}>{c.bank}</Txt>
      <View style={styles.card}>
        <Txt style={styles.sectionTitle}>{c.aman}</Txt><Txt>{c.amanText}</Txt>
        <Button title={c.call} icon="call-outline" onPress={() => open('tel:8002626')} />
        <Button title={c.sms} secondary icon="chatbubble-outline" onPress={() => open('sms:2828')} />
        <Txt selectable style={[styles.muted, { marginTop: 16 }]}>{c.manual}</Txt>
        <Button title={c.source} secondary icon="open-outline" onPress={() => open(helpSources.aman)} />
      </View>
      <View style={styles.card}><Icon name="shield-outline" color={colors.primary} size={36} /><Txt style={{ marginTop: 16 }}>{c.police}</Txt>
        <Button title={c.scope} secondary icon="open-outline" onPress={() => open(helpSources.scope)} /></View>
      <View style={styles.card}><Txt>{c.emergency}</Txt><Button title={c.emergencyCall} secondary icon="call-outline" onPress={() => open('tel:999')} /></View>
      <Txt style={[styles.muted, { marginTop: 20 }]}>{c.checked}</Txt>
    </> : panel === 'guides' ? <>
      <Txt style={[styles.muted, { marginTop: 16 }]}>{c.preserve}</Txt>
      {!guide ? <><Txt style={{ marginTop: 20 }}>{c.guideIntro}</Txt>{(['whatsapp', 'apple', 'google'] as Guide[]).map(key => <Button key={key} title={c.guideLabels[key]} secondary icon="chatbubbles-outline" onPress={() => setGuide(key)} />)}</> : <>
        <Txt style={[styles.muted, { marginTop: 16 }]}>{c.illustration}</Txt>
        {c.guidesText[guide].map((text, i) => <View key={i} style={styles.card}>
          <Txt style={styles.sectionTitle}>{c.step} {i + 1}</Txt>
          <View accessible={false} aria-hidden importantForAccessibility="no-hide-descendants" style={{ borderWidth: 2, borderColor: colors.controlBorder, borderRadius: 20, padding: 16, backgroundColor: colors.subtle }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.controlBorder, alignSelf: 'center', marginBottom: 16 }} />
            <View style={{ borderWidth: 2, borderColor: colors.primary, borderRadius: 12, padding: 12, backgroundColor: colors.primarySoft }}>
              <Row><Icon name={i === 0 ? 'person-circle-outline' : i === 1 ? 'ban-outline' : 'checkmark-circle-outline'} size={32} color={colors.primary} /><Txt style={{ flex: 1, fontWeight: '700' }}>{c.diagram[i]}</Txt><Icon name="hand-left-outline" size={24} color={colors.primary} /></Row>
            </View>
            <View style={{ height: 8, width: '80%', borderRadius: 4, backgroundColor: colors.line, marginTop: 16 }} /><View style={{ height: 8, width: '55%', borderRadius: 4, backgroundColor: colors.line, marginTop: 8 }} />
          </View>
          <Txt style={{ marginTop: 16 }}>{text}</Txt>
        </View>)}
        <Button title={c.original} secondary icon="open-outline" onPress={() => open(helpSources[guide])} />
      </>}
    </> : stage === 'intro' ? <>
      <View style={styles.card}><Icon name="help-buoy-outline" size={48} color={colors.primary} /><Txt style={{ marginTop: 16 }}>{c.intro}</Txt>
        <Button title={c.start} onPress={() => { setStage('questions'); setIndex(0); }} /></View>
      <Txt style={[styles.muted, { marginTop: 20 }]}>{c.urgent}</Txt><Txt style={[styles.muted, { marginTop: 16 }]}>{c.local}</Txt>
    </> : stage === 'questions' ? <View style={styles.card}>
      <Txt style={styles.eyebrow}>{c.question} {index + 1} {c.of} {recoveryQuestions.length}</Txt>
      <Txt style={styles.sectionTitle}>{c.questions[question]}</Txt>
      {(['yes', 'no', 'unsure'] as RecoveryAnswer[]).map(value => <Touch key={value} accessibilityRole="radio" accessibilityLabel={c[value]} aria-checked={answers[question] === value} accessibilityState={{ checked: answers[question] === value }}
        onPress={() => { setAnswers(current => ({ ...current, [question]: value })); setDone([]); }}
        style={{ marginTop: 12, padding: 16, borderWidth: 1, borderColor: colors.controlBorder, backgroundColor: answers[question] === value ? colors.primarySoft : colors.surface }}>
        <Row><Icon name={answers[question] === value ? 'radio-button-on' : 'radio-button-off'} size={24} color={colors.primary} /><Txt>{c[value]}</Txt></Row>
      </Touch>)}
      <Button title={c.next} disabled={!answers[question]} onPress={next} />
      {(question === 'payment' || question === 'card') && <Txt style={[styles.muted, { marginTop: 20 }]}>{c.urgent}</Txt>}
    </View> : stage === 'steps' ? <>
      <View style={styles.card}>
        <Txt style={styles.eyebrow}>{c.step} {index + 1} {c.of} {topics.length}</Txt>
        <Txt style={styles.sectionTitle}>{c.titles[topic]}</Txt>
        {uncertain && index === 0 && <Txt style={[styles.muted, { marginBottom: 16 }]}>{c.uncertain}</Txt>}
        {steps.map((text, i) => <Txt key={i} style={{ marginBottom: 20 }}>{text}</Txt>)}
        <Touch accessibilityRole="checkbox" accessibilityLabel={c.done} aria-checked={done.includes(topic)} accessibilityState={{ checked: done.includes(topic) }} onPress={() => setDone(current => current.includes(topic) ? current.filter(key => key !== topic) : [...current, topic])}>
          <Row><Icon name={done.includes(topic) ? 'checkbox' : 'square-outline'} size={26} color={colors.primary} /><Txt style={{ flex: 1 }}>{c.done}</Txt></Row>
        </Touch>
        {topic === 'protect' && <Button title={c.guides} secondary icon="images-outline" onPress={() => show('guides')} />}
        <Button title={index === topics.length - 1 ? c.finish : c.next} onPress={next} />
      </View>
      <Txt style={[styles.muted, { marginTop: 16 }]}>{c.ticks}</Txt>
    </> : <View style={styles.card}><Txt>{c.endHelp}</Txt><Button title={c.edit} secondary onPress={() => { setStage('questions'); setIndex(0); }} /><Button title={c.home} onPress={() => router.replace('/')} /></View>}
    {panel !== 'help' && <Button title={c.help} secondary icon="call-outline" onPress={() => show('help')} />}
    {!!error && <Txt accessibilityRole="alert" style={styles.error}>{error}</Txt>}
  </Screen>;
}
