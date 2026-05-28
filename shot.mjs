import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  // Set auth state so it goes straight to Home
  await page.goto('http://localhost:4175');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('hellobrick_authenticated', 'true');
    localStorage.setItem('hellobrick_onboarding_finished', 'true');
    localStorage.setItem('hellobrick_is_pro', 'true');
    localStorage.setItem('hellobrick_userId', 'demo-user');
    
    // Simulate a user scanning their first set!
    const mockCollection = [
      {
        id: 'scan-123',
        setNum: '10305-1',
        condition: 'sealed',
        purchasePrice: 399.99,
        quantity: 1,
        dateAdded: new Date().toISOString()
      }
    ];
    localStorage.setItem('hellobrick_collection_sets', JSON.stringify(mockCollection));
  });
  
  // 1. HOME SCREEN (Scanned State)
  await page.goto('http://localhost:4175');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/Users/akeemojuko/.gemini/antigravity/brain/c9a346fa-fd30-491b-b36f-544379ba2170/shot_tested_dashboard.png' });

  // 2. PORTFOLIO ANALYTICS
  await page.evaluate(() => window.__navigate('PORTFOLIO_ANALYTICS'));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/akeemojuko/.gemini/antigravity/brain/c9a346fa-fd30-491b-b36f-544379ba2170/shot_tested_portfolio.png' });

  await browser.close();
})();

