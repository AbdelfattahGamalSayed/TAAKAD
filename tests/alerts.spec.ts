import {test,expect} from '@playwright/test';
const base={items:[],sources:[{id:'admo-en-security',category:'security',status:'ready',lastSuccessAt:'2026-11-19T12:00:00Z'}],refreshing:false,checkedAt:'2026-11-19T12:00:00Z',nextCheckAt:'2026-11-19T13:00:00Z',recentCount:0,publisherCount:1,permissionUrl:'https://www.mediaoffice.abudhabi/en/rss-news-feeds-abu-dhabi-media-office/'};
const item={id:'test',title:'Cyber safety awareness programme',excerpt:'Official test excerpt.',url:'https://www.mediaoffice.abudhabi/en/security/example/',publishedAt:'2026-07-01T00:00:00Z',locale:'en',publisher:'Abu Dhabi Media Office',older:true,stale:false};
test('older updates are dated, source credited, filters and refresh work',async({page})=>{
 let calls=0;await page.route('**/api/alerts?locale=en',r=>{calls++;return r.fulfill({json:{...base,items:[item]}});});
 await page.goto('/alerts');await expect(page.getByText(item.title,{exact:true})).toBeVisible();await expect(page.getByTestId('intro')).toBeHidden();
 await expect(page.getByText('Earlier update',{exact:true})).toBeVisible();
 await expect(page.getByText("No new updates in the past 30 days. Older updates are shown below.",{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Past 30 days',exact:true}).click();await expect(page.getByText(item.title,{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'All updates',exact:true}).click();await expect(page.getByText(item.title,{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect.poll(()=>calls).toBe(2);
 await page.getByText(item.title,{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'.local/alerts-test.png'});
});
test('unavailable feed is not represented as no threats',async({page})=>{
 await page.route('**/api/alerts*',r=>r.fulfill({json:{...base,sources:[{...base.sources[0],status:'unavailable'}]}}));
 await page.goto('/alerts');await expect(page.getByText("Some updates could not be loaded. Try refreshing later.",{exact:true})).toBeVisible();
});
test('stale items are explicitly labelled',async({page})=>{
 await page.route('**/api/alerts*',r=>r.fulfill({json:{...base,items:[{...item,stale:true}],sources:[{...base.sources[0],status:'stale'}]}}));
 await page.goto('/alerts');await expect(page.getByText("This saved update may be out of date.",{exact:true})).toBeVisible();
});
test('Arabic switches feed locale and clears English content',async({page})=>{
 const arTitle='توعية بمخاطر الاحتيال الإلكتروني';
 await page.route('**/api/alerts?locale=en',r=>r.fulfill({json:{...base,items:[item]}}));
 await page.route('**/api/alerts?locale=ar',r=>r.fulfill({json:{...base,items:[{...item,title:arTitle,locale:'ar',url:'https://www.mediaoffice.abudhabi/ar/security/example/'}]}}));
 await page.goto('/alerts');await expect(page.getByText(item.title,{exact:true})).toBeVisible();await page.getByRole('button',{name:'Switch to Arabic'}).click();
 await expect(page.getByText(arTitle,{exact:true})).toBeVisible();await expect(page.getByText(item.title,{exact:true})).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('network error is actionable',async({page})=>{
 await page.route('**/api/alerts*',r=>r.abort());
 await page.goto('/alerts');await expect(page.getByRole('alert')).toContainText('Cannot load updates');await expect(page.getByRole('button',{name:'Refresh',exact:true})).toBeEnabled();
});
test('initial background collection is shown as loading then polled',async({page})=>{
 let calls=0;await page.route('**/api/alerts*',r=>{calls++;return r.fulfill({json:calls===1?{...base,refreshing:true}:{...base,items:[item]}});});
 await page.goto('/alerts');await expect(page.getByText("Looking for updates…",{exact:true})).toBeVisible();await expect(page.getByText(item.title,{exact:true})).toBeVisible({timeout:10000});
});
