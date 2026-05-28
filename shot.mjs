import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  
  // Navigate to auth
  await page.goto('http://localhost:4175');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.goto('http://localhost:4175');
  
  await page.waitForTimeout(2000); // Wait for onboarding animations
  await page.screenshot({ path: '/Users/akeemojuko/.gemini/antigravity/brain/c9a346fa-fd30-491b-b36f-544379ba2170/shot_onboarding_fixed.png' });
  
  // Click next slide
  await page.evaluate(() => {
    document.querySelector('button')?.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/akeemojuko/.gemini/antigravity/brain/c9a346fa-fd30-491b-b36f-544379ba2170/shot_onboarding_slide2.png' });
  
  await browser.close();
})();
