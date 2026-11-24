import React,{useLayoutEffect,useState} from 'react';
import {Image,PanResponder,Platform,View,useWindowDimensions,type ViewStyle} from 'react-native';
import {Button,Details,Icon,Row,Txt,useTheme} from './ui';
import {useApp} from '../lib/state';
import {moveCrop,WHOLE_PHOTO,type Photo,type CropRect,type CropHandle} from '../lib/screenshot';

import {cropCopy} from '../lib/cropCopy';
type Props={photo:Photo;crop:CropRect;onChange:(crop:CropRect)=>void;disabled:boolean};
type GestureProps={crop:CropRect;width:number;height:number;onChange:Props['onChange']};
// Keep a single responder alive throughout a drag, including rerenders.
class CropGesture {
 current:GestureProps;start:CropRect;responder:ReturnType<typeof PanResponder.create>;
 constructor(handle:CropHandle,props:GestureProps){
  this.current=props;this.start=props.crop;
  this.responder=PanResponder.create({
   onStartShouldSetPanResponder:()=>true,onMoveShouldSetPanResponder:()=>true,
   onPanResponderGrant:()=>{this.start={...this.current.crop};},
   onPanResponderMove:(_,gesture)=>{const p=this.current;p.onChange(moveCrop(this.start,handle,gesture.dx/p.width,gesture.dy/p.height,Math.min(.4,48/p.width),Math.min(.4,48/p.height)));},
   onPanResponderTerminationRequest:()=>false
  });
 }
 update(props:GestureProps){this.current=props;}
}
function DragArea({handle,crop,width,height,onChange,style,children}:{handle:CropHandle;crop:CropRect;width:number;height:number;onChange:Props['onChange'];style:React.ComponentProps<typeof View>['style'];children?:React.ReactNode}){
 const [gesture]=useState(()=>new CropGesture(handle,{crop,width,height,onChange}));
 useLayoutEffect(()=>gesture.update({crop,width,height,onChange}),[gesture,crop,width,height,onChange]);
 return <View {...gesture.responder.panHandlers} testID={'crop-'+handle} accessible={false} aria-hidden style={[style,Platform.OS==='web'?{touchAction:'none'} as ViewStyle & {touchAction:'none'}:undefined]}>{children}</View>;
}
export function PhotoCrop({photo,crop,onChange,disabled}:Props){
 const {locale}=useApp(),{colors}=useTheme(),c=cropCopy[locale];
 const [editing,setEditing]=useState(false),[available,setAvailable]=useState(0);
 const window=useWindowDimensions();
 const scale=Math.min(Math.max(1,available-48)/photo.width,Math.min(420,window.height*.48)/photo.height);
 const width=photo.width*scale,height=photo.height*scale;
 const changed=crop.x!==0||crop.y!==0||crop.width!==1||crop.height!==1;
 const trim=(edge:'top'|'bottom'|'left'|'right')=>{
  const delta=.05;
  if(edge==='top')onChange(moveCrop(crop,'topLeft',0,delta));
  if(edge==='bottom')onChange(moveCrop(crop,'bottomRight',0,-delta));
  if(edge==='left')onChange(moveCrop(crop,'topLeft',delta,0));
  if(edge==='right')onChange(moveCrop(crop,'bottomRight',-delta,0));
 };
 return <View>
  <View onLayout={e=>setAvailable(e.nativeEvent.layout.width)} style={{backgroundColor:colors.cropBackground,borderRadius:16,paddingVertical:28,alignItems:'center',marginTop:8}}>
   {available>0&&<View style={{width,height,direction:'ltr'}}>
    <Image source={{uri:photo.uri}} style={{width,height}} resizeMode="contain" accessibilityLabel={c.preview}/>
    {editing&&<View testID="crop-editor" pointerEvents={disabled?'none':'auto'} style={{position:'absolute',inset:0,direction:'ltr'}}>
     <View pointerEvents="none" accessible={false} aria-hidden style={{position:'absolute',left:0,top:0,width,height:crop.y*height,backgroundColor:colors.cropScrim}}/>
     <View pointerEvents="none" accessible={false} aria-hidden style={{position:'absolute',left:0,top:(crop.y+crop.height)*height,width,bottom:0,backgroundColor:colors.cropScrim}}/>
     <View pointerEvents="none" accessible={false} aria-hidden style={{position:'absolute',left:0,top:crop.y*height,width:crop.x*width,height:crop.height*height,backgroundColor:colors.cropScrim}}/>
     <View pointerEvents="none" accessible={false} aria-hidden style={{position:'absolute',left:(crop.x+crop.width)*width,right:0,top:crop.y*height,height:crop.height*height,backgroundColor:colors.cropScrim}}/>
     <DragArea handle="move" crop={crop} width={width} height={height} onChange={onChange} style={{position:'absolute',left:crop.x*width,top:crop.y*height,width:crop.width*width,height:crop.height*height,borderWidth:2,borderColor:colors.white}}>
      {[1,2].map(n=><React.Fragment key={n}><View pointerEvents="none" style={{position:'absolute',left:n/3*crop.width*width,top:0,bottom:0,width:1,backgroundColor:colors.cropGrid}}/><View pointerEvents="none" style={{position:'absolute',top:n/3*crop.height*height,left:0,right:0,height:1,backgroundColor:colors.cropGrid}}/></React.Fragment>)}
     </DragArea>
     {(['topLeft','topRight','bottomLeft','bottomRight'] as const).map(handle=><DragArea key={handle} handle={handle} crop={crop} width={width} height={height} onChange={onChange} style={{position:'absolute',left:(crop.x+(handle.endsWith('Right')?crop.width:0))*width-24,top:(crop.y+(handle.startsWith('bottom')?crop.height:0))*height-24,width:48,height:48,alignItems:'center',justifyContent:'center'}}>
      <View style={{width:20,height:20,borderRadius:4,backgroundColor:colors.white,borderWidth:3,borderColor:colors.cropHandle}}/>
     </DragArea>)}
    </View>}
    {!editing&&changed&&<View pointerEvents="none" style={{position:'absolute',left:crop.x*width,top:crop.y*height,width:crop.width*width,height:crop.height*height,borderWidth:3,borderColor:colors.white}}/>}
   </View>}
  </View>
  {!editing?<Button title={c.crop} secondary icon="crop-outline" onPress={()=>setEditing(true)} disabled={disabled}/>:<>
   <Row style={{marginTop:16}}><Icon name="crop-outline" color={colors.primary} size={24}/><Txt style={{flex:1}}>{c.hint}</Txt></Row>
   <Button title={c.whole} secondary onPress={()=>{onChange({...WHOLE_PHOTO});setEditing(false);}} disabled={disabled}/>
   <Details title={c.adjust}>
    <Row><View style={{flex:1}}><Button title={c.top} secondary onPress={()=>trim('top')} disabled={disabled}/></View><View style={{flex:1}}><Button title={c.bottom} secondary onPress={()=>trim('bottom')} disabled={disabled}/></View></Row>
    <Row><View style={{flex:1}}><Button title={c.left} secondary onPress={()=>trim('left')} disabled={disabled}/></View><View style={{flex:1}}><Button title={c.right} secondary onPress={()=>trim('right')} disabled={disabled}/></View></Row>
    <Button title={c.expand} secondary disabled={disabled} onPress={()=>{const x=Math.max(0,crop.x-.05),y=Math.max(0,crop.y-.05);onChange({x,y,width:Math.min(1,crop.x+crop.width+.05)-x,height:Math.min(1,crop.y+crop.height+.05)-y});}}/>
    <Button title={c.reset} secondary disabled={disabled} onPress={()=>onChange({...WHOLE_PHOTO})}/>
   </Details>
  </>}
 </View>;
}
