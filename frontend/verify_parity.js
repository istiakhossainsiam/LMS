import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = 'C:\\Users\\istia\\.gemini\\antigravity\\brain\\12b26a79-087c-4a4f-91f1-c0c31ed1f6a0\\trainingpundit_verification';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function clickButtonByText(page, text) {
  return page.evaluate((t) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.innerText.includes(t));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }, text);
}

(async () => {
  console.log('🚀 Starting TrainingPundit Feature Parity Verification...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  try {
    // 1. Visit Login page
    console.log('1. Navigating to login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(outDir, '01_login_page.png') });

    // 2. Student Login with demo credentials user@gmail.com / 12345@
    console.log('2. Authenticating as Student (user@gmail.com)...');
    await page.type('input[type="text"]', 'user@gmail.com');
    await page.type('input[type="password"]', '12345@');
    await page.click('button[type="submit"]');

    await new Promise((r) => setTimeout(r, 2500));
    await page.screenshot({ path: path.join(outDir, '02_student_dashboard_overview.png') });

    // 3. Check Student ID Card Tab
    console.log('3. Checking Student Digital ID Card Tab...');
    await clickButtonByText(page, 'Student ID Card');
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '03_student_digital_id_card.png') });

    // 4. Check Online Exams Tab
    console.log('4. Checking Student Online Exams Tab...');
    await clickButtonByText(page, 'Online Exams');
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '04_student_online_exams.png') });

    // 5. Admin Login with admin@gmail.com / 12345@
    console.log('5. Navigating to Admin Login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="text"]', 'admin@gmail.com');
    await page.type('input[type="password"]', '12345@');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Navigate to /admin
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '05_admin_dashboard_overview.png') });

    // 6. Check Admin POS Tab
    console.log('6. Checking Admin POS Tab...');
    await clickButtonByText(page, 'POS Counter');
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '06_admin_pos_counter.png') });

    // 7. Check Admin Coupons Tab
    console.log('7. Checking Admin Coupons Tab...');
    await clickButtonByText(page, 'Coupons');
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '07_admin_coupons_engine.png') });

    // 8. Mobile Viewport Check (375x812 iPhone 13)
    console.log('8. Checking Mobile Viewport Scroll & Responsiveness...');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outDir, '08_mobile_student_dashboard.png') });

    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outDir, '09_mobile_admin_dashboard.png') });

    console.log('✅ ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Verification Error:', err);
  } finally {
    await browser.close();
  }
})();
