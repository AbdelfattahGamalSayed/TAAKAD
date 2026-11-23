import { test, expect } from '@playwright/test';
import { flowCopy } from '../src/lib/checkFlow';
import { copy } from '../src/lib/copy';
import { finishReview, pasteAndConfirm } from './check-helpers';

const message='Reset your bank account password. Send your verification code now.';
const result={status:'assessed',riskLevel:5,messageRiskLevel:5,summary:'Do not share your code.',observedSignals:[],recommendedActions:['Open your bank app to check.'],limitations:[],evidenceQuality:'strong',evidence:[],extractedText:message,detectedUrls:[],urlEvidence:[],analysisMode:'ai',analyzedAt:new Date().toISOString(),locale:'en'};
test.beforeEach(async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});});

for(const locale of ['en','ar'] as const) test(`${locale}: relevant questions, explicit consent and unverified context reach analysis`,async({page})=>{
  const g=flowCopy[locale],t=copy[locale];let calls=0;let sent:Record<string,unknown>={};
  await page.addInitScript(locale=>localStorage.setItem('t2akkad-language',locale),locale);
  await page.route('**/api/analyze',r=>{calls++;sent=r.request().postDataJSON();return r.fulfill({json:result});});
  await page.goto('/');await page.getByRole('button',{name:g.pasteMessage,exact:true}).click();
  await page.getByRole('textbox',{name:t.message,exact:true}).fill(locale==='en'?message:'إعادة تعيين كلمة المرور لحسابك البنكي. أرسل رمز التحقق الآن.');
  await page.getByRole('button',{name:g.next,exact:true}).click();
  await expect(page.getByText(g.hasAccount,{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:g.next,exact:true})).toBeDisabled();
  await page.getByRole('radio',{name:g.yes,exact:true}).click();
  await page.getByRole('button',{name:g.next,exact:true}).click();
  await expect(page.getByText(g.requestedReset,{exact:true})).toBeVisible();
  await page.getByRole('radio',{name:g.no,exact:true}).click();
  await page.screenshot({path:`.local/guided-context-${locale}.png`});
  await page.getByRole('button',{name:g.back,exact:true}).click();
  await expect(page.getByRole('radio',{name:g.yes,exact:true})).toBeChecked();
  await page.getByRole('button',{name:g.next,exact:true}).click();
  await expect(page.getByRole('radio',{name:g.no,exact:true})).toBeChecked();
  await page.getByRole('button',{name:g.next,exact:true}).click();
  expect(calls).toBe(0);
  await page.getByRole('button',{name:t.analyze,exact:true}).click();
  await expect(page.getByRole('alert')).toHaveText(t.consentRequired);expect(calls).toBe(0);
  await page.getByRole('checkbox').click();await page.getByRole('button',{name:t.analyze,exact:true}).click();
  await expect(page.getByTestId('warning-score')).toHaveText('5 / 5');
  expect(sent.context).toEqual({hasAccount:'yes',requestedReset:'no'});expect(sent.image).toBeNull();expect(calls).toBe(1);
});

test('editing the reviewed message invalidates context and consent',async({page})=>{
  await page.goto('/');await pasteAndConfirm(page,message);
  await expect(page.getByRole('checkbox')).toBeChecked();
  await page.getByRole('button',{name:'Edit the message',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Message',exact:true})).toHaveValue(message);
  await page.getByRole('textbox',{name:'Message',exact:true}).fill('See you for coffee tomorrow.');
  await finishReview(page);
  await expect(page.getByRole('radio')).toHaveCount(0);
  await expect(page.getByText('Your answers',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('checkbox')).not.toBeChecked();
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Message',exact:true})).toHaveValue('See you for coffee tomorrow.');
});

test('skipped questions are explicit and do not block a check',async({page})=>{
  let sent:Record<string,unknown>={};
  await page.route('**/api/analyze',r=>{sent=r.request().postDataJSON();return r.fulfill({json:result});});
  await page.goto('/');await pasteAndConfirm(page,message);await page.getByRole('button',{name:'Check for warning signs',exact:true}).click();
  await expect(page.getByTestId('warning-score')).toBeVisible();
  expect(sent.context).toEqual({hasAccount:'skipped',requestedReset:'skipped'});
});

test('pasted links skip unrelated context and keep the entire URL',async({page})=>{
  let sent:Record<string,unknown>={};const url='https://example.com/path?a=1&b=2';
  await page.route('**/api/analyze',r=>{sent=r.request().postDataJSON();return r.fulfill({json:{...result,status:'insufficient_information',riskLevel:null,messageRiskLevel:null}});});
  await page.goto('/');await page.getByRole('button',{name:'Paste Text',exact:true}).click();
  await page.getByRole('textbox',{name:'Message',exact:true}).fill(url);
  await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('button',{name:'Paste Text',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Message',exact:true})).toHaveValue(url);
  await finishReview(page);await page.getByRole('checkbox').click();await page.getByRole('button',{name:'Check for warning signs',exact:true}).click();
  await expect(page.getByText('What to do next',{exact:true})).toBeVisible();expect(sent.text).toBe(url);expect(sent.context).toEqual({});
});

test('leaving Check cancels a request and a late response cannot redirect another tab',async({page})=>{
  let release=()=>{};const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/analyze',async r=>{await pending;await r.fulfill({json:result}).catch(()=>{});});
  await page.goto('/');await pasteAndConfirm(page,'Send your code now.');await page.getByRole('button',{name:'Check for warning signs',exact:true}).click();
  await page.getByRole('tab',{name:'Learn',exact:true}).click();release();
  await expect(page.getByText('Stay safe online',{exact:true})).toBeVisible();
  await page.getByRole('tab',{name:'Check',exact:true}).click();
  await expect(page.getByRole('button',{name:'Check for warning signs',exact:true})).toBeVisible();
  await expect(page.getByText('Send your code now.',{exact:true})).toBeVisible();
});
