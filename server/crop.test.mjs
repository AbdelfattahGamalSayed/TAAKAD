import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const {cropPixels,moveCrop,WHOLE_PHOTO}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(readFileSync(new URL('../src/lib/screenshot.ts',import.meta.url),'utf8'))).toString('base64'));
test('whole-photo and rectangular crop preserve the intended source pixels',()=>{
 assert.deepEqual(cropPixels(WHOLE_PHOTO,600,400),{originX:0,originY:0,width:600,height:400});
 assert.deepEqual(cropPixels({x:.1,y:.25,width:.8,height:.5},600,400),{originX:60,originY:100,width:480,height:200});
 assert.throws(()=>cropPixels({x:NaN,y:0,width:1,height:1},600,400));
});
test('dragging corners or moving the crop cannot escape the photo or invert the rectangle',()=>{
 for(const handle of ['topLeft','topRight','bottomLeft','bottomRight','move'])for(const dx of [-4,-.1,0,.1,4])for(const dy of [-4,-.1,0,.1,4]){
  const r=moveCrop({x:.2,y:.2,width:.6,height:.6},handle,dx,dy);
  assert.ok(r.x>=0&&r.y>=0&&r.width>=.149&&r.height>=.149);
  assert.ok(r.x+r.width<=1.00001&&r.y+r.height<=1.00001);
  const pixels=cropPixels(r,749,1331);assert.ok(pixels.originX+pixels.width<=749&&pixels.originY+pixels.height<=1331);
 }
});
