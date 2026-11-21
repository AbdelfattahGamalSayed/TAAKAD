import { test, expect } from '@playwright/test';
import { copy } from '../src/lib/copy';
import { featureCopy } from '../src/lib/features';

const message='Send your verification code now.';
for(const locale of ['en','ar'] as const) {
  const t=copy[locale], f=featureCopy[locale];
  test(`${locale}: next steps and limitations are visible, technical details are optional`,async({page})=>{
    await page.addInitScript(locale=>localStorage.setItem('t2akkad-language',locale),locale);
    await page.emulateMedia({reducedMotion:'reduce'});
    const summary=locale==='en'?'Someone is asking for your private code.':'يطلب منك شخص رمزك الخاص.';
    const action=locale==='en'?'Do not share the code.':'لا تشارك الرمز.';
    await page.route('**/api/analyze',r=>r.fulfill({json:{status:'assessed',riskLevel:4,messageRiskLevel:4,summary,observedSignals:[],recommendedActions:[action],limitations:['Technical test limitation'],evidenceQuality:'strong',evidence:[{quote:message,reason:'Evidence explanation'}],extractedText:message,detectedUrls:[],urlEvidence:[],analysisMode:'ai',analyzedAt:new Date().toISOString(),locale}}));
    await page.goto('/');
    await page.getByRole('tab',{name:t.message,exact:true}).click();
    await page.getByRole('textbox',{name:t.message,exact:true}).fill(message);
    await page.getByRole('checkbox').click();
    await page.getByRole('button',{name:t.analyze,exact:true}).click();
    await expect(page.getByText(action,{exact:true})).toBeVisible();
    await expect(page.getByTestId('warning-score')).toHaveText('4 / 5');
    await expect(page.getByTestId('warning-score')).toHaveCSS('direction','ltr');
    await expect(page.getByText(t.noGuarantee,{exact:true})).toBeVisible();
    await expect(page.getByText(f.evidence,{exact:true})).toHaveCount(0);
    await expect(page.getByText('Technical test limitation',{exact:true})).toHaveCount(0);
    const toggle=page.getByRole('button',{name:t.moreDetails,exact:true});
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await page.screenshot({path:`.local/plain-result-${locale}.png`,fullPage:true});
    await toggle.focus();await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await expect(page.getByText(message,{exact:true})).toBeVisible();
    await expect(page.getByText('Technical test limitation',{exact:true})).toBeVisible();
    await toggle.click();
    await expect(page.getByText(f.evidence,{exact:true})).toHaveCount(0);
    await expect(page.getByText(action,{exact:true})).toBeVisible();
  });

  test(`${locale}: service errors give recovery instructions and preserve the draft`,async({page})=>{
    await page.addInitScript(locale=>localStorage.setItem('t2akkad-language',locale),locale);
    await page.emulateMedia({reducedMotion:'reduce'});
    let code='API_NOT_CONFIGURED';
    await page.route('**/api/analyze',r=>r.fulfill({status:503,json:{error:code}}));
    await page.goto('/');await page.getByRole('tab',{name:t.message,exact:true}).click();
    await page.getByRole('textbox',{name:t.message,exact:true}).fill(message);
    await page.getByRole('checkbox').click();
    for(const error of ['API_NOT_CONFIGURED','UNAUTHORIZED','INVALID_AI_RESPONSE'] as const){
      code=error;await page.getByRole('button',{name:t.analyze,exact:true}).click();
      await expect(page.getByRole('alert')).toHaveText(t.errors[error]);
      await expect(page.getByRole('alert')).not.toContainText(/API|server|\.env|npm|Expo|الخادم/);
      await expect(page.getByRole('textbox',{name:t.message,exact:true})).toHaveValue(message);
      await expect(page.getByRole('button',{name:t.analyze,exact:true})).toBeEnabled();
    }
  });

  test(`${locale}: essential privacy and demo notice remain visible without details`,async({page})=>{
    await page.addInitScript(locale=>localStorage.setItem('t2akkad-language',locale),locale);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.route('**/api/health',r=>r.fulfill({json:{ok:true,configured:true}}));
    await page.goto('/settings');
    await expect(page.getByText(t.privacyBody,{exact:true})).toBeVisible();
    await expect(page.getByText(t.prototypeBody,{exact:true})).toBeVisible();
    await expect(page.getByText(t.localNetwork,{exact:true})).toHaveCount(0);
    await page.getByRole('button',{name:t.moreDetails,exact:true}).click();
    await expect(page.getByText(t.localNetwork,{exact:true})).toBeVisible();
    await expect(page.getByText(t.dataDetails,{exact:true})).toBeVisible();
  });
}
