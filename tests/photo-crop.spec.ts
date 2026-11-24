import {test,expect,type Page} from '@playwright/test';
import {cropCopy} from '../src/lib/cropCopy';
import {copy} from '../src/lib/copy';
import {flowCopy} from '../src/lib/checkFlow';

async function selectPhoto(page:Page,locale:'en'|'ar'='en'){
 const data=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=600;c.height=400;const x=c.getContext('2d')!;x.fillStyle='#fff';x.fillRect(0,0,600,400);x.fillStyle='#008000';x.fillRect(0,0,20,20);x.fillStyle='#0000ff';x.fillRect(580,380,20,20);x.fillStyle='#000';x.font='24px Arial';x.fillText('Send your verification code now',35,200);return c.toDataURL('image/png');});
 const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:copy[locale].upload,exact:true}).click();
 await(await chooser).setFiles({name:'synthetic-crop.png',mimeType:'image/png',buffer:Buffer.from(data.split(',')[1],'base64')});
 await expect(page.getByRole('button',{name:cropCopy[locale].scan,exact:true})).toBeVisible();
}
async function pixels(page:Page,image:string){return page.evaluate(async uri=>{const i=new Image();i.src=uri;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d')!;x.drawImage(i,0,0);return {width:i.width,height:i.height,top:[...x.getImageData(0,0,1,1).data],bottom:[...x.getImageData(i.width-1,i.height-1,1,1).data]};},image);}
test.beforeEach(async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});});
for(const locale of ['en','ar'] as const)for(const theme of ['light','dark'])test(`${locale} ${theme}: select once, crop locally, approve before sending`,async({page})=>{
 const c=cropCopy[locale];let selections=0,calls=0,sent:Record<string,unknown>={};page.on('filechooser',()=>selections++);
 await page.addInitScript(({locale,theme})=>{localStorage.setItem('t2akkad-language',locale);localStorage.setItem('t2akkad-theme',theme);},{locale,theme});
 await page.route('**/api/extract',r=>{calls++;sent=r.request().postDataJSON();return r.fulfill({json:{status:'readable',text:'Send your verification code now.',sender:'Synthetic',warnings:[]}});});
 await page.goto('/');await selectPhoto(page,locale);expect(calls).toBe(0);
 await expect(page.getByText(c.privacy,{exact:true})).toBeVisible();await page.getByRole('button',{name:c.crop,exact:true}).click();
 await page.getByRole('button',{name:c.adjust,exact:true}).click();
 for(const title of [c.top,c.bottom,c.left,c.right]){const button=page.getByRole('button',{name:title,exact:true});await button.focus();await page.keyboard.press('Enter');}
 expect(selections).toBe(1);expect(calls).toBe(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`.local/crop-${locale}-${theme}.png`});await page.getByRole('button',{name:c.scan,exact:true}).click();
 await expect(page.getByRole('button',{name:copy[locale].analyze,exact:true})).toBeVisible();expect(calls).toBe(1);expect(sent.consent).toBe(true);
 expect(await pixels(page,sent.image as string)).toEqual({width:540,height:360,top:[255,255,255,255],bottom:[255,255,255,255]});
});
test('dragging corners and moving the frame stays usable; whole-photo reset preserves every pixel',async({page})=>{
 let image='';await page.route('**/api/extract',r=>{image=r.request().postDataJSON().image;return r.fulfill({json:{status:'readable',text:'Hello from a synthetic test.',sender:'',warnings:[]}});});
 await page.goto('/');await selectPhoto(page);await page.getByRole('button',{name:'Crop photo',exact:true}).click();
 const before=(await page.getByTestId('crop-move').boundingBox())!;
 const corner=(await page.getByTestId('crop-topLeft').boundingBox())!;
 await page.mouse.move(corner.x+24,corner.y+24);await page.mouse.down();await page.mouse.move(corner.x+49,corner.y+49,{steps:8});await page.mouse.up();
 const after=(await page.getByTestId('crop-move').boundingBox())!;expect(after.width).toBeLessThan(before.width-15);expect(after.height).toBeLessThan(before.height-15);
 await page.mouse.move(after.x+after.width/2,after.y+after.height/2);await page.mouse.down();await page.mouse.move(after.x+after.width/2+500,after.y+after.height/2+500,{steps:8});await page.mouse.up();
 const moved=(await page.getByTestId('crop-move').boundingBox())!;expect(moved.x+moved.width).toBeLessThanOrEqual(before.x+before.width+1);expect(moved.y+moved.height).toBeLessThanOrEqual(before.y+before.height+1);
 await page.getByRole('button',{name:'Use whole photo',exact:true}).click();await expect(page.getByTestId('crop-editor')).toHaveCount(0);
 await page.getByRole('button',{name:'Scan photo',exact:true}).click();await expect(page.getByRole('button',{name:'Check for warning signs',exact:true})).toBeVisible();
 expect(await pixels(page,image)).toEqual({width:600,height:400,top:[0,128,0,255],bottom:[0,0,255,255]});
});
test('changing the crop after reading discards extracted text, answers and consent',async({page})=>{
 let calls=0;await page.route('**/api/extract',r=>{calls++;return r.fulfill({json:{status:'readable',text:'Reset your bank account password. Send your verification code now.',sender:'Synthetic',warnings:[]}});});
 await page.goto('/');await selectPhoto(page);await page.getByRole('button',{name:'Scan photo',exact:true}).click();
 await page.getByRole('radio',{name:'Yes',exact:true}).click();await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('button',{name:'Skip this question',exact:true}).click();
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('button',{name:'Back',exact:true}).click();
 await page.getByRole('button',{name:'Crop photo',exact:true}).click();await page.getByRole('button',{name:'Adjust without dragging',exact:true}).click();await page.getByRole('button',{name:'Trim left',exact:true}).click();
 await page.getByRole('button',{name:'Scan photo',exact:true}).click();await expect(page.getByText(flowCopy.en.hasAccount,{exact:true})).toBeVisible();expect(calls).toBe(2);
 await expect(page.getByRole('radio',{name:'Yes',exact:true})).not.toBeChecked();await page.getByRole('button',{name:'Skip this question',exact:true}).click();await page.getByRole('button',{name:'Skip this question',exact:true}).click();await expect(page.getByRole('checkbox')).not.toBeChecked();
});
test.describe('mobile touch input',()=>{
 test.use({hasTouch:true,isMobile:true});
 test('a finger drag resizes the selected image frame without scrolling the page',async({page})=>{
  await page.goto('/');await selectPhoto(page);await page.getByRole('button',{name:'Crop photo',exact:true}).click();
  await page.getByTestId('crop-editor').scrollIntoViewIfNeeded();
  const before=(await page.getByTestId('crop-move').boundingBox())!,corner=(await page.getByTestId('crop-topLeft').boundingBox())!;
  const session=await page.context().newCDPSession(page),x=corner.x+24,y=corner.y+24;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let n=1;n<=8;n++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+n*3,y:y+n*3}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();
  const after=(await page.getByTestId('crop-move').boundingBox())!;expect(after.width).toBeLessThan(before.width-15);expect(after.height).toBeLessThan(before.height-15);expect(after.y).toBeGreaterThan(before.y+15);
  await page.screenshot({path:'.local/crop-touch.png'});
 });
});
