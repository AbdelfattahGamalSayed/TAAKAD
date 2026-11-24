import { finishReview, pasteAndConfirm } from './check-helpers';
import { test, expect, type Page } from '@playwright/test';
const message='Your account is blocked. Send your OTP now. https://example.com/verify';
const result={status:'assessed',riskLevel:4,messageRiskLevel:4,summary:'A request for a private code is suspicious.',observedSignals:['Asks for a verification code.'],recommendedActions:['Do not share the code.'],limitations:['Sender identity was not verified.'],evidenceQuality:'strong',evidence:[{quote:'Send your OTP now',reason:'Requests a private authentication code.'}],extractedText:message,detectedUrls:['https://example.com/verify'],urlEvidence:[{url:'https://example.com/verify',hostname:'example.com',unicodeHostname:'example.com',signals:[],reputation:{status:'not_listed',source:'Phishing.Database',fetchedAt:'2026-11-19T12:00:00Z',stale:false}}],analysisMode:'ai',analyzedAt:'2026-11-19T12:00:00Z',locale:'en'};
async function start(page:Page){await page.route('**/api/health',route=>route.fulfill({json:{ok:true,configured:true}}));await page.goto('/');await expect(page.getByRole('button',{name:'Add a screenshot'})).toBeVisible();await expect(page.getByTestId('intro')).toBeHidden();}
async function fillMessage(page:Page){await pasteAndConfirm(page,message);}
async function uploadSynthetic(page:Page,scan=true){
 const uri=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=600;c.height=400;const x=c.getContext('2d')!;x.fillStyle='#fff';x.fillRect(0,0,600,400);x.fillStyle='#008000';x.fillRect(0,0,20,20);x.fillStyle='#0000ff';x.fillRect(580,380,20,20);x.fillStyle='#000';x.font='24px Arial';x.fillText('Send your OTP now',30,200);return c.toDataURL('image/png');});
 const pending=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Add a screenshot'}).click();
 await (await pending).setFiles({name:'synthetic-message.png',mimeType:'image/png',buffer:Buffer.from(uri.split(',')[1],'base64')});
 await expect(page.getByRole('button',{name:'Scan photo',exact:true})).toBeVisible();
 if(scan)await page.getByRole('button',{name:'Scan photo',exact:true}).click();
}

test('whole photo goes straight to context; optional edit and text-only assessment remain',async({page})=>{
 let extracted:Record<string,unknown>={},analyzed:Record<string,unknown>={},extractCalls=0,analysisCalls=0;
 await page.route('**/api/extract',route=>{extractCalls++;extracted=route.request().postDataJSON();return route.fulfill({json:{status:'readable',text:message,sender:'Sample',warnings:[]}});});
 await page.route('**/api/analyze',route=>{analysisCalls++;analyzed=route.request().postDataJSON();return route.fulfill({json:result});});
 await start(page);await expect(page.getByText(/Photos go to OpenAI only when you tap Scan photo/)).toBeVisible();await uploadSynthetic(page,false);
 expect(extractCalls).toBe(0);await page.getByRole('button',{name:'Scan photo',exact:true}).click();
 await expect(page.getByText('Do you have an account with the service mentioned in this message?',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Read screenshot text'})).toHaveCount(0);await expect(page.getByRole('textbox',{name:'Message',exact:true})).toHaveCount(0);
 const pixels=await page.evaluate(async(uri:string)=>{const img=new Image();img.src=uri;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d')!;x.drawImage(img,0,0);return{width:img.width,height:img.height,top:[...x.getImageData(5,5,1,1).data],bottom:[...x.getImageData(595,395,1,1).data]};},extracted.image as string);
 expect(pixels).toEqual({width:600,height:400,top:[0,128,0,255],bottom:[0,0,255,255]});expect(extracted.consent).toBe(true);expect(analysisCalls).toBe(0);
 await page.getByRole('button',{name:'Back',exact:true}).click();await expect(page.getByRole('img',{name:'Selected photo',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Next',exact:true}).click();expect(extractCalls).toBe(1);
 await page.getByRole('button',{name:'Skip this question'}).click();await page.getByRole('button',{name:'Edit the message'}).click();
 await expect(page.getByRole('textbox',{name:'Message',exact:true})).toHaveValue(message);await page.getByRole('textbox',{name:'Sender name or number (optional)'}).fill('Reviewed sender');await finishReview(page);
 await page.getByRole('checkbox').click();await page.getByRole('button',{name:'Check for warning signs'}).click();
 await expect(page.getByText('What to do next',{exact:true})).toBeVisible();expect(analyzed.image).toBeNull();expect(analyzed.source).toBe('transcribed_screenshot');expect(analyzed.reviewConfirmed).toBeUndefined();
});
test('failed photo reading can be removed without analysis',async({page})=>{
 await page.route('**/api/extract',r=>r.fulfill({status:503,json:{error:'AI_UNAVAILABLE'}}));await start(page);await uploadSynthetic(page);
 await expect(page.getByRole('alert')).toBeVisible();await page.getByRole('button',{name:'More details',exact:true}).click();await page.getByRole('button',{name:'Remove',exact:true}).click();await expect(page.getByRole('button',{name:'Add a screenshot'})).toBeVisible();await expect(page.getByRole('checkbox')).toHaveCount(0);
});
test('unclear OCR asks for correction only when needed',async({page})=>{
 await page.route('**/api/extract',route=>route.fulfill({json:{status:'unclear',text:'',sender:'',warnings:[]}}));await start(page);await uploadSynthetic(page);
 await expect(page.getByText('Check the words',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Next',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();
});
test('provider failure is visible and preserves editable input',async({page})=>{
 await page.route('**/api/analyze',route=>route.fulfill({status:503,json:{error:'AI_UNAVAILABLE'}}));await start(page);await fillMessage(page);await page.getByRole('button',{name:'Check for warning signs'}).click();await expect(page.getByRole('alert')).toBeVisible();await page.getByRole('button',{name:'Edit the message',exact:true}).click();await expect(page.getByRole('textbox',{name:'Message',exact:true})).toHaveValue(message);
});
test('cancel ignores a late result',async({page})=>{
 let respond=()=>{};const gate=new Promise<void>(resolve=>{respond=resolve;});await page.route('**/api/analyze',async route=>{await gate;await route.fulfill({json:result}).catch(()=>{});});
 await start(page);await fillMessage(page);await page.getByRole('button',{name:'Check for warning signs'}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();respond();await expect(page.getByRole('button',{name:'Check for warning signs'})).toBeVisible();expect(page.url()).not.toContain('/result');
});
for(const status of ['listed','unavailable'] as const)test('explicit reputation state: '+status,async({page})=>{
 const entry={...result.urlEvidence[0],reputation:{...result.urlEvidence[0].reputation,status,stale:status==='listed'}};
 await page.route('**/api/analyze',route=>route.fulfill({json:{...result,messageRiskLevel:2,urlEvidence:[entry]}}));await start(page);await fillMessage(page);await page.getByRole('button',{name:'Check for warning signs'}).click();
 await page.getByRole('button',{name:'More details',exact:true}).click();
 await expect(page.getByText(status==='listed'?"This website has been reported for scams":"We could not check reports about this website",{exact:true})).toBeVisible();if(status==='listed')await expect(page.getByText("Using an older list. We could not update it.",{exact:true})).toBeVisible();
});
test('insufficient information shows no numeric rating',async({page})=>{
 await page.route('**/api/analyze',route=>route.fulfill({json:{...result,status:'insufficient_information',riskLevel:null,messageRiskLevel:null,evidence:[],evidenceQuality:'limited',summary:'More context is needed.',urlEvidence:[]}}));
 await start(page);await fillMessage(page);await page.getByRole('button',{name:'Check for warning signs'}).click();await expect(page.getByText('More context is needed.',{exact:true})).toBeVisible();await expect(page.getByTestId('warning-score')).toHaveCount(0);
});
test('recovery journey and completion reminders work offline',async({page})=>{
 await start(page);await page.getByRole('button',{name:'I already clicked something. Help me!'}).click();await page.getByRole('button',{name:'Help me take action'}).click();
 await page.context().setOffline(true);
 for(let i=0;i<5;i++){await page.getByRole('radio',{name:'Yes',exact:true}).click();await page.getByRole('button',{name:'Next',exact:true}).click();}
 await expect(page.getByText('Protect your money',{exact:true})).toBeVisible();const step=page.getByRole('checkbox');await step.click();await expect(step).toBeChecked();await step.click();await expect(step).not.toBeChecked();await page.screenshot({path:'.local/recovery-mobile.png'});
});
test('Arabic layout and dark preference persist on narrow screens',async({page})=>{
 await start(page);await page.getByRole('tab',{name:/Settings/}).click();await page.getByRole('radio',{name:'Dark',exact:true}).click();await page.getByRole('radio',{name:'العربية',exact:true}).click();await page.reload();await expect(page.getByTestId('intro')).toBeHidden();await expect(page.getByRole('radio',{name:'داكن',exact:true})).toBeChecked();
 await page.goto('/recovery');await page.getByRole('button',{name:'ساعدني على التصرف'}).click();await expect(page.getByText('اتخذ الخطوة الآمنة التالية',{exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await expect(page.getByTestId('intro')).toBeHidden();await page.screenshot({path:'.local/recovery-arabic-dark.png'});
});
