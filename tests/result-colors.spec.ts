import {test,expect} from '@playwright/test';
import {copy} from '../src/lib/copy';
import {pasteAndConfirm} from './check-helpers';
for(const theme of ['light','dark'])for(const score of [1,3,5])test(`${theme}: warning level ${score} has a distinct symbol, label and next action`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(theme=>localStorage.setItem('t2akkad-theme',theme),theme);
 await page.route('**/api/analyze',r=>r.fulfill({json:{status:'assessed',riskLevel:score,messageRiskLevel:score,summary:'Synthetic result for visual testing.',observedSignals:[],recommendedActions:['Check with the sender using a number you already trust.'],limitations:['Sender identity was not verified.'],evidenceQuality:'limited',evidence:[],extractedText:'Synthetic test message',detectedUrls:[],urlEvidence:[],analysisMode:'ai',analyzedAt:new Date().toISOString(),locale:'en'}}));
 await page.goto('/');await pasteAndConfirm(page,'Synthetic test message');await page.getByRole('button',{name:copy.en.analyze,exact:true}).click();
 await expect(page.getByTestId('warning-score')).toHaveText(`${score} / 5`);await expect(page.getByText(copy.en.riskLabels[score-1],{exact:true})).toBeVisible();
 await expect(page.getByText('Check with the sender using a number you already trust.',{exact:true})).toBeVisible();
 await expect(page.getByTestId('result-symbol')).toBeVisible();await expect(page.getByText(copy.en.noGuarantee,{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`.local/result-${theme}-${score}.png`});
});
