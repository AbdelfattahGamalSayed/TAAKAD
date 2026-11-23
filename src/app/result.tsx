import { Touch as Pressable , Icon as Ionicons , Button, Details, Row, Screen, Txt, useTheme } from '../components/ui';
import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../lib/state';

import { featureCopy } from '../lib/features';

export default function ResultScreen() {
  const { colors, styles } = useTheme();
  const { result, setResult, t, rtl, locale } = useApp();
  const f = featureCopy[locale];
  const [sourceError,setSourceError] = useState('');
  const [showText, setShowText] = useState(false);
  function reset() { setResult(null); router.replace('/'); }
  if (!result) return <Screen><Txt style={styles.heading}>{t.empty}</Txt><Txt style={[styles.muted, { marginTop: 16 }]}>{t.emptySub}</Txt><Button title={t.check} onPress={reset} /></Screen>;
  const score = result.riskLevel;
  const riskColor = score === null ? colors.muted : score >= 4 ? colors.red : score >= 2 ? colors.amber : colors.green;
  const riskBg = score === null ? colors.subtle : score >= 4 ? colors.riskHigh : score >= 2 ? colors.riskMedium : colors.riskLow;
  return <Screen>
    <Pressable accessibilityRole="button" onPress={() => router.back()}><Row style={{ gap: 7, marginBottom: 20 }}><Ionicons name={rtl ? 'arrow-forward' : 'arrow-back'} color={colors.primary} size={20} /><Txt style={{ color: colors.primary, fontSize:16 }}>{t.back}</Txt></Row></Pressable>
    <Txt style={[styles.heading, { fontSize: 31 }]}>{t.result}</Txt>
    <View style={[styles.card, { backgroundColor: riskBg, borderColor: riskBg, alignItems: 'center', paddingVertical: 28 }]}>
      <View style={{width:104,height:104,borderRadius:52,alignItems:'center',justifyContent:'center',marginBottom:20,borderWidth:2,borderColor:score===null?colors.line:score>=4?colors.red:score>=2?colors.resultAmber:colors.resultGreen}}><Ionicons name={score===null?'help-circle-outline':score>=4?'close-circle-outline':score>=2?'warning-outline':'checkmark-circle-outline'} size={64} color={riskColor}/></View>
      <Txt style={{ fontSize: 22, fontWeight: '700', color: riskColor, textAlign: 'center' }}>{score === null ? t.unable : t.riskLabels[score - 1]}</Txt>
      {score !== null && <Txt testID="warning-score" accessibilityLabel={t.score+': '+score+' / 5'} style={{fontSize:32,fontWeight:'800',color:riskColor,writingDirection:'ltr',textAlign:'center',marginVertical:12}}>{score+' / 5'}</Txt>}
      {score !== null && <Row style={{ gap: 7, marginBottom: 20 }}>{[1, 2, 3, 4, 5].map(n => <View key={n} style={{ width: 39, height: 7, borderRadius: 5, backgroundColor: score !== null && n <= score ? riskColor : colors.line }} />)}</Row>}
      <Txt style={{ textAlign: 'center', fontSize:16, marginTop: 13, lineHeight:24 }}>{result.summary}</Txt>
    </View>
    {result.urlEvidence.some(entry=>entry.reputation.status==='listed') && <Txt style={[styles.error,{color:colors.red}]}>{f.listedNotice}</Txt>}
    <View style={[styles.card, { borderColor: colors.accentBorder }]}><Txt style={styles.sectionTitle}>{t.actions}</Txt><Txt>{result.recommendedActions[0]}</Txt></View>
    <Button title={f.recovery} icon="help-buoy-outline" secondary onPress={()=>router.push('/recovery')}/>
    <Txt style={[styles.muted,{marginTop:16}]}>{t.noGuarantee}</Txt>
    {score !== null && score <= 2 && <Txt style={styles.muted}>{t.shortLimit}</Txt>}
    <Button title={t.newCheck} icon="add-circle-outline" onPress={reset} />
    <Details testID="result-details">
    {result.recommendedActions.length>1&&<View><Txt style={styles.sectionTitle}>{t.actions}</Txt>{result.recommendedActions.slice(1).map((line,i)=><Txt key={i} style={{marginBottom:12}}>{i+2}. {line}</Txt>)}</View>}
    <Txt style={[styles.muted,{marginTop:14,fontSize:16}]}>{f.scale}</Txt>
    <Txt style={{marginTop:12,fontWeight:'600'}}>{f.quality}: {f[result.evidenceQuality]}</Txt>
    {result.messageRiskLevel !== result.riskLevel && <Txt style={styles.muted}>{f.aiScore}: {result.messageRiskLevel === null ? f.noRisk : result.messageRiskLevel + ' / 5'}. {f.overall}</Txt>}
    {result.evidence.length>0 && <View style={styles.card}><Txt style={styles.sectionTitle}>{f.evidence}</Txt>{result.evidence.map((item,i)=><View key={i} style={{marginBottom:18}}>
      <View style={{backgroundColor:colors.riskMedium,padding:12,borderRadius:10,borderStartWidth:3,borderColor:colors.amber}}><Txt selectable style={{fontWeight:'700'}}>{item.quote}</Txt></View>
      <Txt style={{marginTop:8,fontSize:16}}>{item.reason}</Txt>
    </View>)}</View>}
    {result.observedSignals.length > 0 && <View style={styles.card}><Txt style={styles.sectionTitle}>{t.reasons}</Txt>{result.observedSignals.map((line, i) => <Row key={i} style={{ alignItems: 'flex-start', marginBottom: 12 }}><Ionicons name="search-outline" color={riskColor} size={19} style={{ marginTop: 3 }} /><Txt style={{ flex: 1, fontSize:16 }}>{line}</Txt></Row>)}</View>}
    {result.urlEvidence.length>0 && <View style={styles.card}>
      <Txt style={styles.sectionTitle}>{f.links}</Txt>
      {result.urlEvidence.map((entry,i)=><View key={i} style={{marginBottom:22,borderBottomWidth:1,borderColor:colors.line,paddingBottom:16}}>
        <Txt selectable style={{writingDirection:'ltr',textAlign:'left',fontWeight:'700',fontSize:16}}>{entry.hostname}</Txt>
        {entry.unicodeHostname!==entry.hostname&&<Txt selectable style={{writingDirection:'ltr',textAlign:'left'}}>{entry.unicodeHostname}</Txt>}
        <Txt selectable style={{writingDirection:'ltr',textAlign:'left',fontSize:16,color:colors.muted}}>{entry.url}</Txt>
        <Txt style={{fontWeight:'700',marginTop:12,color:entry.reputation.status==='listed'?colors.red:colors.muted}}>{f[entry.reputation.status]}</Txt>
        {entry.reputation.fetchedAt&&<Txt style={{fontSize:16,color:colors.muted}}>{f.refreshed}: {new Date(entry.reputation.fetchedAt).toLocaleString(locale==='ar'?'ar-AE':'en-GB')}</Txt>}
        {entry.reputation.stale&&<Txt style={{color:colors.amber,fontSize:16}}>{f.stale}</Txt>}
        {entry.signals.length>0&&<View style={{marginTop:12}}><Txt style={{fontSize:16,fontWeight:'700'}}>{f.lexical}</Txt>{entry.signals.map(signal=><Txt key={signal} style={{fontSize:16,color:colors.muted}}>• {f.signals[signal as keyof typeof f.signals]||signal}</Txt>)}</View>}
      </View>)}
      <Txt style={styles.muted}>{f.linkLimit}</Txt>
      <Button title={f.source+' ↗'} secondary onPress={()=>{Linking.openURL('https://github.com/Phishing-Database/Phishing.Database').catch(()=>setSourceError(locale==='ar'?"تعذّر فتح الصفحة. تحقّق من الإنترنت وحاول مجدداً.":"Could not open the page. Check your internet and try again."));}}/>
      {!!sourceError&&<Txt accessibilityRole="alert">{sourceError}</Txt>}
    </View>}
    <View style={{ marginTop: 24 }}><Row style={{ gap: 8, marginBottom: 9 }}><Ionicons name="information-circle-outline" color={colors.muted} size={18} /><Txt style={{ fontSize:16, fontWeight: '700' }}>{t.limitations}</Txt></Row>{result.limitations.map((line, i) => <Txt key={i} style={{ fontSize:16, lineHeight:24, color: colors.muted, marginBottom: 7 }}>{line}</Txt>)}</View>
    {result.extractedText ? <View style={{ marginTop: 18 }}><Pressable accessibilityRole="button" accessibilityState={{ expanded: showText }} onPress={() => setShowText(!showText)}><Row style={{ justifyContent: 'space-between', paddingVertical: 10 }}><Txt style={{ fontSize:16, fontWeight: '600' }}>{t.extracted}</Txt><Ionicons name={showText ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} /></Row></Pressable>{showText && <View style={{ backgroundColor: colors.subtle, borderRadius: 12, padding: 14 }}><Txt selectable style={{ fontSize:16 }}>{result.extractedText}</Txt></View>}</View> : null}
    </Details>
  </Screen>;
}
