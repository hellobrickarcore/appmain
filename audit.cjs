const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}`));

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  // Wait for React to render
  await page.waitForTimeout(2000);
  
  // Create an output folder for the audit
  if (!fs.existsSync('audit_screenshots')) {
    fs.mkdirSync('audit_screenshots');
  }

  // Force navigate to ONBOARDING_QUESTIONNAIRE via the window.__navigate hook
  await page.evaluate(() => {
    window.__navigate('ONBOARDING_QUESTIONNAIRE');
  });
  await page.waitForTimeout(1000);

  // Take screenshot of Slide 0
  await page.screenshot({ path: 'audit_screenshots/slide_0.png' });
  console.log('Captured Slide 0');

  // Click "Continue" to go to Slide 1
  await page.click('text="Continue"');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'audit_screenshots/slide_1.png' });
  console.log('Captured Slide 1');

  // Click "Continue" to go to Slide 2 (Question 1)
  await page.click('text="Continue"');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'audit_screenshots/slide_2_q1.png' });
  console.log('Captured Slide 2 (Q1)');

  // Answer Q1: Click TikTok
  await page.click('text=/TikTok/i');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'audit_screenshots/slide_3_q2.png' });
  console.log('Captured Slide 3 (Q2)');

  // Answer Q2: Click Identify pieces fast
  await page.click('text=/Identify pieces fast/i');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'audit_screenshots/slide_4_q3.png' });
  console.log('Captured Slide 4 (Q3)');

  // Answer Q3: Click A rough guess
  await page.click('text=/A rough guess/i');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'audit_screenshots/slide_5_q4.png' });
  console.log('Captured Slide 5 (Q4)');

  // Answer Q4: Click Casual builder
  await page.click('text=/Casual builder/i');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'audit_screenshots/slide_6_q5.png' });
  console.log('Captured Slide 6 (Q5)');

  // Answer Q5: Click Every month
  await page.click('text=/Every month/i');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'audit_screenshots/slide_7_loader.png' });
  console.log('Captured Slide 7 (Loader)');

  // Wait for loader to finish
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'audit_screenshots/slide_7_done.png' });
  console.log('Captured Slide 7 (Done)');

  // Click "See my plan"
  await page.click('text="See my plan"');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'audit_screenshots/slide_8_rating.png' });
  console.log('Captured Ratings Popup');

  console.log('\n--- BROWSER LOGS ---');
  console.log(logs.join('\n'));
  console.log('--------------------\n');

  await browser.close();
})();
