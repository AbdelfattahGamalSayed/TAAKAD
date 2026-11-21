import type { ImagePickerOptions } from 'expo-image-picker';
export type Photo = { uri: string; width: number; height: number };
export function pickerOptions(crop = false, platform = 'ios'): ImagePickerOptions {
 return { mediaTypes:['images'],allowsEditing:crop && platform !== 'web',allowsMultipleSelection:false,quality:1,exif:false };
}
export function resizedWidth(width:number,height:number): number | null {
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('INVALID_IMAGE');
 const scale=Math.min(1,1600/Math.max(width,height));
 return scale<1?Math.max(1,Math.round(width*scale)):null;
}
