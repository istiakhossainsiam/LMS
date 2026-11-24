import puppeteer from 'puppeteer-core';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function checkStudentResponse() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('response', async (res) => {
    if (res.url().includes('login') && res.request().method() === 'POST') {
      console.log('Login POST response status:', res.status());
      try {
        const text = await res.text();
        console.log('Login response body snippet:', text.slice(0, 300));
      } catch (e) {}
    }
  });

  await page.goto('https://lms.innovativeitsoft.com/login', { waitUntil: 'networkidle2' });
  await page.type('#email', 'user@gmail.com');
  await page.type('#password', '12345@');

  const btn = await page.$('button[type="submit"]');
  if (btn) await btn.click();
  await new Promise(r => setTimeout(r, 4000));

  const alertText = await page.evaluate(() => {
    const alerts = Array.from(document.querySelectorAll('.alert, .error, .toast, [role="alert"], .text-danger, .invalid-feedback')).map(a => a.innerText.trim()).filter(Boolean);
    return alerts;
  });
  console.log('Alerts on page:', alertText);
  await browser.close();
}

checkStudentResponse();
