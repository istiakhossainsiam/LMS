import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\istia\\.gemini\\antigravity\\brain\\12b26a79-087c-4a4f-91f1-c0c31ed1f6a0\\lms_inspection';

async function inspectStudentLogin() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://lms.innovativeitsoft.com/login', { waitUntil: 'networkidle2' });

  // Get login form details
  const formDetails = await page.evaluate(() => {
    const form = document.querySelector('form');
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
      name: i.name,
      type: i.type,
      id: i.id,
      placeholder: i.placeholder
    }));
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim(),
      type: b.type,
      class: b.className
    }));
    return { action: form?.action, method: form?.method, inputs, buttons };
  });

  console.log('Login Form Details:', JSON.stringify(formDetails, null, 2));

  // Fill in email and password
  await page.type('input[type="email"], input[name="email"], input[name="username"]', 'user@gmail.com');
  await page.type('input[type="password"]', '12345@');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'student_login_before_click.png') });

  // Click login button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await (await btn.getProperty('innerText')).jsonValue();
    if (text.includes('Login') || text.includes('লগইন') || text.includes('Sign in')) {
      console.log('Clicking button with text:', text);
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 5000));
  console.log('URL after login attempt:', page.url());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'student_after_login.png'), fullPage: true });

  const studentPageData = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      navLinks: Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href })).filter(l => l.text && l.text.length < 50),
      bodySnippet: document.body.innerText.slice(0, 1000)
    };
  });

  console.log('Student Page Data:', JSON.stringify(studentPageData, null, 2));
  await browser.close();
}

inspectStudentLogin();
