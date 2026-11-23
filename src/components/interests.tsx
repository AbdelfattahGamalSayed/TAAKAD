import {View} from 'react-native';
import {Details,Touch,Txt,useTheme} from './ui';
import {useApp} from '../lib/state';
import {interests,interestCopy} from '../lib/interests';
export function InterestFilter(){
 const {locale,interest,setInterest}=useApp(),{colors,styles}=useTheme(),c=interestCopy[locale];
 return <Details title={c.title}><Txt style={styles.sectionTitle}>{c.title}</Txt><Txt style={styles.muted}>{c.hint}</Txt><View style={{gap:12,marginTop:12}}>{interests.map(value=><Touch key={value} accessibilityRole="radio" accessibilityLabel={c[value]} aria-checked={interest===value} accessibilityState={{checked:interest===value}} onPress={()=>setInterest(value)} style={{padding:16,backgroundColor:interest===value?colors.primarySoft:colors.surface,borderWidth:1,borderColor:colors.controlBorder}}><Txt style={{fontWeight:interest===value?'700':'400'}}>{c[value]}</Txt></Touch>)}</View></Details>;
}
