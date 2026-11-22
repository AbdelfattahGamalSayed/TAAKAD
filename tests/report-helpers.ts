import {type Page} from '@playwright/test';
import {reportCopy} from '../src/lib/reports';
export async function fillReport(page:Page,note:string,locale:'en'|'ar'='en'){
 const c=reportCopy[locale];await page.getByRole('button',{name:c.start,exact:true}).click();
 await page.getByRole('radio',{name:c.channel.whatsapp,exact:true}).click();await page.getByRole('button',{name:c.next,exact:true}).click();
 await page.getByRole('radio',{name:c.request.code,exact:true}).click();await page.getByRole('button',{name:c.next,exact:true}).click();
 await page.getByRole('radio',{name:c.outcome.stopped,exact:true}).click();await page.getByRole('button',{name:c.no,exact:true}).click();await page.getByRole('textbox',{name:c.note,exact:true}).fill(note);
}
