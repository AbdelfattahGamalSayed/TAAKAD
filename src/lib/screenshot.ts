import type { ImagePickerOptions } from 'expo-image-picker';
export type Photo = { uri: string; width: number; height: number };
export function pickerOptions(): ImagePickerOptions {
 return { mediaTypes:['images'],allowsEditing:false,allowsMultipleSelection:false,quality:1,exif:false };
}
export type CropRect = { x:number; y:number; width:number; height:number };
export type CropHandle = 'topLeft'|'topRight'|'bottomLeft'|'bottomRight'|'move';
export const WHOLE_PHOTO: CropRect = {x:0,y:0,width:1,height:1};
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export function moveCrop(start:CropRect,handle:CropHandle,dx:number,dy:number,minWidth=.15,minHeight=.15):CropRect {
 minWidth=Math.min(minWidth,start.width);minHeight=Math.min(minHeight,start.height);
 if(handle==='move')return {...start,x:clamp(start.x+dx,0,1-start.width),y:clamp(start.y+dy,0,1-start.height)};
 const right=start.x+start.width,bottom=start.y+start.height;
 const x=handle.endsWith('Left')?clamp(start.x+dx,0,right-minWidth):start.x;
 const y=handle.startsWith('top')?clamp(start.y+dy,0,bottom-minHeight):start.y;
 const endX=handle.endsWith('Right')?clamp(right+dx,x+minWidth,1):right;
 const endY=handle.startsWith('bottom')?clamp(bottom+dy,y+minHeight,1):bottom;
 return {x,y,width:endX-x,height:endY-y};
}
export function cropPixels(crop:CropRect,width:number,height:number) {
 resizedWidth(width,height);
 if(![crop.x,crop.y,crop.width,crop.height].every(Number.isFinite)||crop.width<=0||crop.height<=0)throw Error('INVALID_CROP');
 const originX=clamp(Math.round(crop.x*width),0,width-1),originY=clamp(Math.round(crop.y*height),0,height-1);
 return {originX,originY,width:clamp(Math.round((crop.x+crop.width)*width)-originX,1,width-originX),height:clamp(Math.round((crop.y+crop.height)*height)-originY,1,height-originY)};
}
export function resizedWidth(width:number,height:number): number | null {
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('INVALID_IMAGE');
 const scale=Math.min(1,1600/Math.max(width,height));
 return scale<1?Math.max(1,Math.round(width*scale)):null;
}
