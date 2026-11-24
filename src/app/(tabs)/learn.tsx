import {useState} from 'react';
import {View} from 'react-native';
import {Button,Details,Icon,Row,Screen,Txt,useTheme} from '../../components/ui';
import {InterestFilter} from '../../components/interests';
import {LearningVideo} from '../../components/learning-video';
import {useApp} from '../../lib/state';
import {interestCopy} from '../../lib/interests';
import {learnCopy} from '../../lib/learnCopy';
import lessons from '../../lib/learning.json';
export default function LearnScreen(){const {locale}=useApp();return <LearnContent key={locale}/>;}
function LearnContent(){
 const {locale,t,interest,setInterest}=useApp(),{colors,styles}=useTheme(),c=learnCopy[locale];
 const [selected,setSelected]=useState<string|null>(null),[step,setStep]=useState(0),[video,setVideo]=useState(false);
 const lesson=lessons.find(l=>l.id===selected),content=lesson?.[locale];
 const visible=lessons.filter(l=>interest==='all'||l.topic===interest);
 function exit(){setSelected(null);setStep(0);setVideo(false);}
 return <Screen key={`${selected}:${step}:${video}`}>
  <Txt style={styles.heading}>{lesson?content!.title:t.learnTitle}</Txt>
  {!lesson?<>
   <Txt style={[styles.muted,{marginTop:12}]}>{c.intro}</Txt><InterestFilter/>
   {interest!=='all'&&<Button title={interestCopy[locale].all} secondary onPress={()=>setInterest('all')}/>}
   {visible.map(l=><View key={l.id} style={styles.card}><Row><Icon name={l.icon as 'key-outline'} color={l.id==='payments'?colors.iconGreen:l.id==='codes'||l.id==='links'?colors.iconAmber:colors.primary} size={36}/><Txt style={[styles.sectionTitle,{flex:1}]}>{l[locale].title}</Txt></Row>
    <Button title={c.guide} accessibilityLabel={c.guide+' — '+l[locale].title} secondary onPress={()=>{setSelected(l.id);setStep(0);setVideo(false);}}/>
    {l.video&&<Button title={c.watch} accessibilityLabel={c.watch+' — '+l[locale].title} icon="play-circle-outline" onPress={()=>{setSelected(l.id);setVideo(true);}}/>}
   </View>)}
   {!visible.length&&<Txt>{c.filtered}</Txt>}
   <Details title={c.credits}><Txt>{c.creditText}</Txt></Details>
  </>:<>
   <Button title={c.done} secondary onPress={exit}/>
   {video?<>
    <LearningVideo key={locale+lesson.id} id={lesson.id as 'codes'|'payments'}/>
    <Button title={c.close} secondary onPress={()=>setVideo(false)}/>
    <Txt style={[styles.sectionTitle,{marginTop:20}]}>{c.transcript}</Txt>
    {content!.steps.map(([title,body],i)=><View key={title} style={styles.card}><Txt style={styles.sectionTitle}>{i+1}. {title}</Txt><Txt>{body}</Txt></View>)}
   </>:<>
    <View style={styles.card}><Txt style={styles.eyebrow}>{c.step} {step+1} / 3</Txt>
     <View accessible={false} aria-hidden style={{backgroundColor:colors.surface,alignItems:'center',padding:28,borderRadius:20,marginVertical:20}}><Icon name={step===0?'hand-left':step===1?'shield-checkmark':'phone-portrait'} size={88} color={step===0?colors.iconAmber:step===1?colors.iconGreen:colors.primary}/></View>
     <Txt style={styles.sectionTitle}>{content!.steps[step][0]}</Txt><Txt>{content!.steps[step][1]}</Txt>
     <Button title={c.back} secondary onPress={()=>step?setStep(step-1):exit()}/>
     <Button title={step===2?c.done:c.next} onPress={()=>step===2?exit():setStep(step+1)}/>
    </View>
   </>}
  </>}
  <Txt style={[styles.muted,{marginTop:20}]}>{t.educational}</Txt>
 </Screen>;
}
