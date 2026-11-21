import { expect, type Page } from '@playwright/test';
import { copy, type Locale } from '../src/lib/copy';
import { flowCopy } from '../src/lib/checkFlow';

export async function finishReview(page: Page, locale: Locale = 'en') {
  const g=flowCopy[locale],t=copy[locale];
  await page.getByRole('button',{name:g.next,exact:true}).click();
  const skip=page.getByRole('button',{name:g.skip,exact:true});
  const analyze=page.getByRole('button',{name:t.analyze,exact:true});
  await expect(skip.or(analyze)).toBeVisible();
  for(let i=0;i<2&&await skip.isVisible();i++) {
    await skip.click();
    await expect(skip.or(analyze)).toBeVisible();
  }
  await expect(analyze).toBeVisible();
}
export async function pasteAndConfirm(page: Page, text: string, locale: Locale = 'en') {
  await page.getByRole('button',{name:flowCopy[locale].pasteMessage,exact:true}).click();
  await page.getByRole('textbox',{name:copy[locale].message,exact:true}).fill(text);
  await finishReview(page,locale);
  await page.getByRole('checkbox').click();
}
