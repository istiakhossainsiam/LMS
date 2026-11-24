import puppeteer from 'puppeteer-core';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testFormSubmit() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://lms.innovativeitsoft.com/login', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    document.querySelector('#email').value = 'user@gmail.com';
    document.querySelector('#password').value = '12345@';
    document.querySelector('form').submit();
  });

  await new Promise(r => setTimeout(r, 5000));
  console.log('URL after form.submit():', page.url());
  const body = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Body:', body);
  await browser.close();
}

testFormSubmit();
