import {test,expect} from '@playwright/test';
import lessons from '../src/lib/learning.json';
import {learnCopy} from '../src/lib/learnCopy';
import {interestCopy,matchesInterest} from '../src/lib/interests';
test.beforeEach(async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});});
test('topic matching supports both languages and All topics retains general updates',()=>{
 expect(matchesInterest('Bank payment alert','money')).toBe(true);expect(matchesInterest('احم حسابك وكلمة المرور','accounts')).toBe(true);expect(matchesInterest('مكالمة واتساب','messages')).toBe(true);expect(matchesInterest('General cyber awareness','all')).toBe(true);expect(matchesInterest('General cyber awareness','money')).toBe(false);
});
for(const locale of ['en','ar'] as const)test(`${locale}: guides, local silent video playback, pause on leaving and written alternative`,async({page})=>{
 const c=learnCopy[locale],lesson=lessons[0][locale];
 await page.addInitScript(l=>localStorage.setItem('t2akkad-language',l),locale);await page.goto('/learn');
 await page.getByRole('button',{name:c.guide+' — '+lesson.title,exact:true}).click();
 await expect(page.getByText(lesson.steps[0][1],{exact:true})).toBeVisible();await page.getByRole('button',{name:c.next,exact:true}).click();await expect(page.getByText(lesson.steps[1][1],{exact:true})).toBeVisible();
 await page.screenshot({path:`.local/learn-guide-${locale}.png`});await page.getByRole('button',{name:c.back,exact:true}).click();await expect(page.getByText(lesson.steps[0][1],{exact:true})).toBeVisible();await page.getByRole('button',{name:c.done,exact:true}).first().click();
 await page.getByRole('button',{name:c.watch+' — '+lesson.title,exact:true}).click();
 const video=page.locator('video');await expect(video).toHaveCount(1);await expect.poll(()=>video.evaluate((e:HTMLVideoElement)=>e.readyState)).toBeGreaterThan(1);
 expect(await video.evaluate((e:HTMLVideoElement)=>e.paused)).toBe(true);await page.getByRole('button',{name:c.play,exact:true}).click();
 await expect.poll(()=>video.evaluate((e:HTMLVideoElement)=>e.currentTime)).toBeGreaterThan(0.1);await page.getByRole('button',{name:c.pause,exact:true}).click();expect(await video.evaluate((e:HTMLVideoElement)=>e.paused)).toBe(true);
 await expect(page.getByText(lesson.steps[2][1],{exact:true})).toBeVisible();await video.scrollIntoViewIfNeeded();await page.screenshot({path:`.local/learn-video-${locale}.png`});
 await page.getByRole('button',{name:c.play,exact:true}).click();await page.getByRole('tab',{name:locale==='en'?'Settings':'الإعدادات',exact:true}).click();
 await expect.poll(()=>page.locator('video').evaluateAll(es=>es.every(e=>(e as HTMLVideoElement).paused))).toBe(true);
});
test('topics persist locally across Learn and Settings, and reset restores general content',async({page})=>{
 const c=interestCopy.en;await page.goto('/learn');await page.getByRole('button',{name:c.title,exact:true}).click();await page.getByRole('radio',{name:c.money,exact:true}).click();
 await expect(page.getByRole('button',{name:'Open guide — Check before you pay',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Open guide — Keep your codes private',exact:true})).toHaveCount(0);
 await page.reload();await expect(page.getByRole('button',{name:'Open guide — Keep your codes private',exact:true})).toHaveCount(0);
 await page.getByRole('tab',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:learnCopy.en.clearTopic,exact:true}).click();
 await page.getByRole('tab',{name:'Learn',exact:true}).click();await expect(page.getByRole('button',{name:'Open guide — Keep your codes private',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('t2akkad-interest'))).toBe('all');
 await page.getByRole('tab',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:learnCopy.en.manage,exact:true}).click();await expect(page.getByRole('button',{name:'Sign in to view my reports',exact:true})).toBeVisible();
});
test('alert topic filter keeps attribution and stale warnings; excerpts stay optional',async({page})=>{
 const c=interestCopy.en;const item={id:'bank',title:'Bank payment warning',excerpt:'Synthetic payment details.',url:'https://www.mediaoffice.abudhabi/en/security/example/',publishedAt:'2026-11-20T00:00:00Z',locale:'en',publisher:'Abu Dhabi Media Office',older:false,stale:true};
 await page.route('**/api/alerts?locale=en',r=>r.fulfill({json:{items:[item,{...item,id:'general',title:'General cyber awareness',excerpt:'General information.'}],sources:[],refreshing:false,checkedAt:null,nextCheckAt:null,recentCount:2}}));
 await page.goto('/alerts');await expect(page.getByText(item.excerpt,{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:c.title,exact:true}).click();await page.getByRole('radio',{name:c.money,exact:true}).click();
 await expect(page.getByText(item.title,{exact:true})).toBeVisible();await expect(page.getByText('General cyber awareness',{exact:true})).toHaveCount(0);
 await expect(page.getByText('This saved update may be out of date.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Read official source',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'From the article',exact:true}).click();await expect(page.getByText(item.excerpt,{exact:true})).toBeVisible();
 await page.getByRole('button',{name:c.all,exact:true}).click();await expect(page.getByText('General cyber awareness',{exact:true})).toBeVisible();
});
