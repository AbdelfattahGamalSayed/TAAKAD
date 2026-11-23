import {useCallback} from 'react';
import {View} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {useEvent} from 'expo';
import {useVideoPlayer,VideoView} from 'expo-video';
import {Button,Txt,useTheme} from './ui';
import {useApp} from '../lib/state';
import {learnCopy} from '../lib/learnCopy';
const clips={codes:{en:require('../../assets/learning/codes-en.mp4'),ar:require('../../assets/learning/codes-ar.mp4')},payments:{en:require('../../assets/learning/payments-en.mp4'),ar:require('../../assets/learning/payments-ar.mp4')}};
export function LearningVideo({id}:{id:'codes'|'payments'}){
 const {locale}=useApp(),{styles}=useTheme(),c=learnCopy[locale];
 const player=useVideoPlayer(clips[id][locale],p=>{p.loop=false;p.muted=true;p.staysActiveInBackground=false;});
 const {isPlaying}=useEvent(player,'playingChange',{isPlaying:player.playing});
 const {status}=useEvent(player,'statusChange',{status:player.status});
 useFocusEffect(useCallback(()=>()=>player.pause(),[player]));
 return <View><VideoView testID="learning-video" player={player} nativeControls fullscreenOptions={{enable:false}} allowsPictureInPicture={false} contentFit="contain" style={{width:'100%',aspectRatio:1,marginTop:16}}/>
  <Txt style={[styles.muted,{marginTop:12}]}>{c.silent}</Txt>
  {status==='error'?<Txt accessibilityRole="alert" style={styles.error}>{c.videoError}</Txt>:<Button title={isPlaying?c.pause:c.play} icon={isPlaying?'pause-outline':'play-outline'} onPress={()=>{if(isPlaying)player.pause();else{if(player.duration&&player.currentTime>=player.duration-0.2)player.replay();else player.play();}}}/>}
 </View>;
}
