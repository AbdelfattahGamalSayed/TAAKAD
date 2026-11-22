import { test, expect, type Page } from '@playwright/test';
import { authCopy } from '../src/lib/authCopy';
// This file uses the local demo auth server. All numbers and drafts are synthetic.
test.beforeEach(async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});});
async function demoLogin(page:Page,phone:string,locale:'en'|'ar'='en'){
  const c=authCopy[locale];await page.getByRole('textbox',{name:c.number,exact:true}).fill(phone);
  await page.getByRole('button',{name:c.send,exact:true}).click();
  const code=await page.getByTestId('demo-code').innerText();await expect(page.getByRole('button',{name:c.resend,exact:true})).toBeDisabled();
  await page.getByRole('textbox',{name:c.code,exact:true}).fill(code);await page.screenshot({path:`.local/auth-code-${locale}.png`});await page.getByRole('button',{name:c.verify,exact:true}).click();
}
for(const locale of ['en','ar'] as const)test(`${locale}: welcome allows guests and UAE PASS cannot sign in`,async({page})=>{
  const c=authCopy[locale];await page.addInitScript(locale=>{localStorage.removeItem('t2akkad-welcome');localStorage.setItem('t2akkad-language',locale);},locale);
  await page.goto('/');await expect(page.getByText(c.welcome,{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:c.pass,exact:true})).toBeDisabled();await expect(page.getByText(c.demo,{exact:true})).toBeVisible();
  await page.screenshot({path:`.local/welcome-${locale}.png`});
  await page.getByRole('button',{name:c.guest,exact:true}).click();await expect(page.getByText(c.welcome,{exact:true})).toHaveCount(0);
  await expect(page.getByRole('tab')).toHaveCount(5);
  for(const tab of await page.getByRole('tab').all())await tab.click();
  await expect(page.getByText(c.guestStatus,{exact:true})).toBeVisible();
});
for(const locale of ['en','ar'] as const)test(`${locale}: guest draft survives demo sign-in and preview remains unpublished`,async({page})=>{
  const c=authCopy[locale],draft='Synthetic scam example for testing.';
  await page.addInitScript(locale=>localStorage.setItem('t2akkad-language',locale),locale);
  await page.goto('/community');await page.getByRole('button',{name:locale==='en'?'Start a discussion':'ابدأ نقاشاً',exact:true}).click();
  await page.getByRole('textbox',{name:c.draftLabel}).fill(draft);await page.getByRole('button',{name:c.loginPost}).click();
  await expect(page.getByText(c.demo,{exact:true})).toBeVisible();await demoLogin(page,locale==='en'?'+971500000101':'+971500000102',locale);
  await expect(page.getByRole('textbox',{name:c.draftLabel})).toHaveValue(draft);await expect(page.getByText(c.session,{exact:true})).toBeVisible();
  const request=page.waitForRequest('**/api/community/preview');
  await page.getByRole('button',{name:c.preview,exact:true}).click();expect((await request).postDataJSON()).toEqual({action:'preview'});await expect(page.getByText(c.previewDone,{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>Object.values(localStorage).join(' ').includes('Synthetic scam example'))).toBe(false);
  await page.screenshot({path:`.local/auth-draft-${locale}.png`});
});
test('wrong and expired codes give recovery options; expiry disables verification',async({page})=>{
  const c=authCopy.en;await page.clock.install();
  await page.route('**/api/auth/start',r=>r.fulfill({json:{mode:'demo',challengeId:'test',demoCode:'123456',serverNow:Date.now(),expiresAt:Date.now()+5000,resendAt:Date.now()+3000}}));
  await page.route('**/api/auth/verify',r=>r.fulfill({status:400,json:{error:'AUTH_CODE'}}));
  await page.goto('/signin');await page.getByRole('button',{name:c.sample}).click();await page.getByRole('button',{name:c.send}).click();
  await page.getByRole('textbox',{name:c.code}).fill('000000');await page.getByRole('button',{name:c.verify}).click();await expect(page.getByRole('alert')).toHaveText(c.errors.AUTH_CODE);
  await page.clock.fastForward(6000);await expect(page.getByText(c.expired,{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:c.verify})).toBeDisabled();await expect(page.getByRole('button',{name:c.resend})).toBeEnabled();
});
test('cancel keeps guest draft and late verification cannot create a client session',async({page})=>{
  const c=authCopy.en;let release=()=>{};const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/auth/start',r=>r.fulfill({json:{mode:'demo',challengeId:'late',demoCode:'123456',serverNow:Date.now(),expiresAt:Date.now()+300000,resendAt:Date.now()+30000}}));
  await page.route('**/api/auth/verify',async r=>{await pending;await r.fulfill({json:{mode:'demo',phoneVerified:false,token:'fake',expiresAt:Date.now()+3600000}}).catch(()=>{});});
  await page.goto('/community');await page.getByRole('button',{name:'Start a discussion',exact:true}).click();await page.getByRole('textbox',{name:c.draftLabel}).fill('Synthetic retained draft');await page.getByRole('button',{name:c.loginPost}).click();
  await page.getByRole('button',{name:c.sample}).click();await page.getByRole('button',{name:c.send}).click();await page.getByRole('textbox',{name:c.code}).fill('123456');await page.getByRole('button',{name:c.verify}).click();
  await page.getByRole('button',{name:c.cancel,exact:true}).click();release();
  await expect(page.getByRole('textbox',{name:c.draftLabel})).toHaveValue('Synthetic retained draft');await expect(page.getByRole('button',{name:c.loginPost})).toBeVisible();
});
test('sign out revokes the session and public features stay available',async({page})=>{
  const c=authCopy.en;await page.goto('/settings');await page.getByRole('button',{name:c.phone}).click();await demoLogin(page,'+971500000103');
  const request=page.waitForRequest('**/api/auth/logout'),response=page.waitForResponse('**/api/auth/logout');
  await page.getByRole('button',{name:c.signout}).click();const headers=(await request).headers();expect((await response).status()).toBe(200);
  const revoked=await page.request.post('/api/community/preview',{headers:{authorization:headers.authorization,'x-session-token':headers['x-session-token']},data:{action:'preview'}});expect(revoked.status()).toBe(401);
  await expect(page.getByText(c.guestStatus,{exact:true})).toBeVisible();
  await page.getByRole('tab',{name:'Check',exact:true}).click();await expect(page.getByRole('button',{name:'Add a screenshot',exact:true})).toBeVisible();
});
test('expired server session returns to guest without losing the draft',async({page})=>{
  const c=authCopy.en;await page.goto('/community');await page.getByRole('button',{name:'Start a discussion',exact:true}).click();await page.getByRole('textbox',{name:c.draftLabel}).fill('Synthetic expired session draft');await page.getByRole('button',{name:c.loginPost}).click();await demoLogin(page,'+971500000104');
  await page.route('**/api/community/preview',r=>r.fulfill({status:401,json:{error:'AUTH_REQUIRED'}}));
  await page.getByRole('button',{name:c.preview,exact:true}).click();await expect(page.getByRole('alert')).toHaveText(c.errors.AUTH_REQUIRED);await expect(page.getByRole('textbox',{name:c.draftLabel})).toHaveValue('Synthetic expired session draft');await expect(page.getByRole('button',{name:c.loginPost})).toBeVisible();
});
