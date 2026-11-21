import { test, expect, type Page } from '@playwright/test';
import { helpSources, recoveryCopy, recoveryQuestions, type RecoveryAnswer } from '../src/lib/recovery';
async function answer(page:Page, values:RecoveryAnswer[], locale:'en'|'ar'='en') {
  const c=recoveryCopy[locale];
  await page.getByRole('button',{name:c.start,exact:true}).click();
  for(let i=0;i<5;i++){
    await expect(page.getByText(c.questions[recoveryQuestions[i]],{exact:true})).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(3);
    await page.getByRole('radio',{name:c[values[i]],exact:true}).click();
    await page.getByRole('button',{name:c.next,exact:true}).click();
  }
}
test.beforeEach(async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});});
for(const locale of ['en','ar'] as const) test(`${locale}: relevant recovery only, Back keeps answers, editing resets ticks`,async({page})=>{
  const c=recoveryCopy[locale];let requests=0;
  await page.addInitScript(locale=>localStorage.setItem('t2akkad-language',locale),locale);
  await page.route('**/api/**',r=>{requests++;return r.fulfill({json:{ok:true}});});
  await page.goto('/recovery');await answer(page,['no','no','no','yes','no'],locale);
  await expect(page.getByText(c.titles.password,{exact:true})).toBeVisible();
  await expect(page.getByText(c.titles.payment,{exact:true})).toHaveCount(0);
  await page.getByRole('checkbox').click();await page.getByRole('button',{name:c.next,exact:true}).click();
  await expect(page.getByText(c.titles.protect,{exact:true})).toBeVisible();
  await page.getByRole('button',{name:c.back,exact:true}).click();await expect(page.getByRole('checkbox')).toBeChecked();
  await page.getByRole('button',{name:c.back,exact:true}).click();
  await expect(page.getByRole('radio',{name:c.no,exact:true})).toBeChecked();
  await page.getByRole('radio',{name:c.yes,exact:true}).click();await page.getByRole('button',{name:c.next,exact:true}).click();
  await expect(page.getByRole('checkbox')).not.toBeChecked();expect(requests).toBe(0);
});
test('all No avoids irrelevant account and bank tasks and finishes without a safety guarantee',async({page})=>{
  const c=recoveryCopy.en;await page.goto('/recovery');await answer(page,['no','no','no','no','no']);
  await expect(page.getByText(c.titles.protect,{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:c.next,exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:c.finish}).click();await expect(page.getByText(c.endHelp)).toBeVisible();
});
test('official source opens only after a tap and uses the fixed police website',async({page})=>{
  let visits=0;await page.route(helpSources.aman,r=>{visits++;return r.fulfill({contentType:'text/html',body:'<p>Mock official contact page</p>'});});
  await page.goto('/recovery');await page.getByRole('button',{name:recoveryCopy.en.help,exact:true}).click();expect(visits).toBe(0);
  await page.getByRole('button',{name:recoveryCopy.en.source,exact:true}).click();
  await expect(page).toHaveURL(helpSources.aman);expect(visits).toBe(1);
});
test('card-only uncertainty receives bank guidance once, with no false completion guarantee',async({page})=>{
  const c=recoveryCopy.en;await page.goto('/recovery');await answer(page,['no','unsure','no','no','no']);
  await expect(page.getByText(c.uncertain)).toBeVisible();await expect(page.getByText(c.titles.payment,{exact:true})).toBeVisible();
  await page.getByRole('button',{name:c.next,exact:true}).click();await expect(page.getByText(c.titles.protect,{exact:true})).toBeVisible();
});
test('questions require an answer and official help returns to the same question',async({page})=>{
  const c=recoveryCopy.en;await page.goto('/recovery');await page.getByRole('button',{name:c.start}).click();
  await expect(page.getByRole('button',{name:c.next,exact:true})).toBeDisabled();
  await page.getByRole('radio',{name:c.unsure,exact:true}).click();await page.getByRole('button',{name:c.help,exact:true}).click();
  await expect(page.getByText(c.amanText,{exact:true})).toBeVisible();await expect(page.getByText(c.police,{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:c.call,exact:true})).toBeVisible();
  await page.getByRole('button',{name:c.back,exact:true}).click();await expect(page.getByRole('radio',{name:c.unsure,exact:true})).toBeChecked();
});
for(const locale of ['en','ar'] as const)test(`${locale}: illustrated guides, source links and official help`,async({page})=>{
  const c=recoveryCopy[locale];await page.setViewportSize({width:375,height:812});
  await page.addInitScript(locale=>{localStorage.setItem('t2akkad-language',locale);localStorage.setItem('t2akkad-theme','dark');},locale);
  await page.goto('/recovery');await answer(page,['no','no','no','no','no'],locale);
  await page.getByRole('button',{name:c.guides,exact:true}).click();
  for(const guide of ['whatsapp','apple','google'] as const){
    await page.getByRole('button',{name:c.guideLabels[guide],exact:true}).click();
    await expect(page.getByText(c.preserve,{exact:true})).toBeVisible();
    for(const text of c.guidesText[guide])await expect(page.getByText(text,{exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:c.original,exact:true})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(guide==='whatsapp')await page.screenshot({path:`.local/recovery-guide-${locale}.png`,fullPage:true});
    await page.getByRole('button',{name:c.back,exact:true}).click();
  }
  await page.getByRole('button',{name:c.help,exact:true}).click();
  await expect(page.getByText(c.checked,{exact:true})).toBeVisible();
  await page.screenshot({path:`.local/recovery-help-${locale}.png`,fullPage:true});
});
