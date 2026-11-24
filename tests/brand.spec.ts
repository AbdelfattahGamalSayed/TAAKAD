import {test,expect} from '@playwright/test';
import {copy} from '../src/lib/copy';
import {flowCopy} from '../src/lib/checkFlow';
import {featureCopy} from '../src/lib/features';
for(const locale of ['en','ar'] as const)test(`${locale}: TAAKAD home has two large choices and short help entry`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(l=>localStorage.setItem('t2akkad-language',l),locale);await page.goto('/');
 await expect(page.getByText('TAAKAD',{exact:true})).toBeVisible();await expect(page.getByText('T2AKKAD',{exact:true})).toHaveCount(0);
 const a=await page.getByTestId('home-screenshot').boundingBox(),b=await page.getByTestId('home-paste').boundingBox();expect(a!.height).toBeGreaterThanOrEqual(160);expect(b!.height).toBeGreaterThanOrEqual(160);expect(a!.width).toBe(b!.width);
 await expect(page.getByRole('button',{name:flowCopy[locale].pasteLink,exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:featureCopy[locale].recovery,exact:true})).toBeVisible();
 await page.screenshot({path:`.local/taakad-home-${locale}.png`});await page.getByRole('button',{name:flowCopy[locale].pasteMessage,exact:true}).click();await expect(page.getByRole('textbox',{name:copy[locale].message,exact:true})).toBeVisible();
});
