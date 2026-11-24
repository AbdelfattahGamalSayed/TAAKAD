import { test, expect } from '@playwright/test';
import { lightColors, darkColors } from '../src/lib/theme';

function luminance(hex: string) {
  const rgb = hex.match(/[a-f\d]{2}/gi)!.map(v => parseInt(v, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
test('light and dark semantic text pairs meet minimum contrast', () => {
  for (const c of [lightColors, darkColors]) {
    const pairs = [[c.text,c.background],[c.text,c.surface],[c.muted,c.surface],[c.muted,c.background],[c.primary,c.primarySoft],[c.primary,c.surface],[c.onAccent,c.accentSolid],[c.onUpload,c.upload],[c.onPaste,c.paste],[c.onRisk,c.dangerSolid],[c.onAmber,c.resultAmber],[c.onRisk,c.resultGreen],[c.iconRed,c.surface],[c.iconAmber,c.surface],[c.iconGreen,c.surface],[c.placeholder,c.input],[c.text,c.errorBg],[c.red,c.riskHigh],[c.amber,c.riskMedium],[c.green,c.riskLow],[c.tipText,c.tipStart],[c.tipText,c.tipEnd]];
    for (const [foreground,background] of pairs) {
      const a=luminance(foreground),b=luminance(background);
      expect((Math.max(a,b)+0.05)/(Math.min(a,b)+0.05), `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});

for (const locale of ['en','ar']) for (const theme of ['light','dark']) {
  test(`${locale} ${theme}: all five tabs, touch targets and reading direction`, async ({ page }) => {
    await page.setViewportSize({width:375,height:844});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(({locale,theme}) => { localStorage.setItem('t2akkad-language',locale);localStorage.setItem('t2akkad-theme',theme); },{locale,theme});
    await page.route('**/api/health',r=>r.fulfill({json:{ok:true,configured:true}}));
    await page.route('**/api/alerts?*',r=>r.fulfill({json:{items:[],sources:[],refreshing:false,checkedAt:null,nextCheckAt:null,recentCount:0,publisherCount:1}}));
    await page.goto('/');
    await expect(page.getByTestId('intro')).toHaveCount(0);
    const names=locale==='en'?['Check','Alerts','Learn','Community','Settings']:['افحص','التنبيهات','تعلّم','المجتمع','الإعدادات'];
    // Use actual route labels rather than assuming translated wording.
    const nav=page.getByRole('tab').filter({has:page.locator('[aria-hidden="true"]')});
    await expect(nav).toHaveCount(5);
    const first=await nav.first().boundingBox(),last=await nav.last().boundingBox();
    expect(locale==='ar'?first!.x>last!.x:first!.x<last!.x).toBe(true);
    for(let i=0;i<5;i++) {
      await nav.nth(i).click();
      await expect(nav.nth(i)).toHaveAttribute('aria-selected','true');
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      const small=await page.locator('[role="button"], [role="tab"], [role="radio"], [role="checkbox"]').evaluateAll(elements=>elements.filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<47.5||r.height<47.5);}).map(e=>e.getAttribute('aria-label')||e.textContent));
      expect(small).toEqual([]);
      await page.screenshot({path:`.local/design-${locale}-${theme}-${names[i]}.png`});
    }
    await page.setViewportSize({width:1024,height:768});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`.local/design-${locale}-${theme}-tablet.png`});
  });
}

test('keyboard focus and 200 percent text remain usable on a small phone', async ({ page }) => {
  await page.setViewportSize({width:375,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const upload=page.getByRole('button',{name:'Add a screenshot',exact:true});
  await upload.focus();
  await expect(upload).toBeFocused();
  await expect(upload).toHaveCSS('outline-width','3px');
  await page.evaluate(()=>{
    const leaves=[...document.querySelectorAll<HTMLElement>('div,span')].filter(e=>e.childNodes.length&&[...e.childNodes].every(n=>n.nodeType===Node.TEXT_NODE)&&!e.getAttribute('aria-hidden'));
    const sizes=leaves.map(e=>({e,font:parseFloat(getComputedStyle(e).fontSize),line:parseFloat(getComputedStyle(e).lineHeight)}));
    sizes.forEach(({e,font,line})=>{e.style.fontSize=font*2+'px';e.style.lineHeight=(Number.isFinite(line)?line*2:font*3)+'px';});
  });
  await upload.scrollIntoViewIfNeeded();
  await expect(upload).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'.local/design-large-text.png'});
});
