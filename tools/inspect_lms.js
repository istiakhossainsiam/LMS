import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\istia\\.gemini\\antigravity\\brain\\12b26a79-087c-4a4f-91f1-c0c31ed1f6a0\\lms_inspection';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runInspection() {
  console.log('Launching Edge for LMS inspection...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const inspectionReport = {
    publicSite: {},
    studentPortal: {},
    adminPortal: {}
  };

  try {
    const page = await browser.newPage();

    // ==========================================
    // 1. PUBLIC HOMEPAGE INSPECTION
    // ==========================================
    console.log('\n--- 1. Inspecting Public Site ---');
    await page.goto('https://lms.innovativeitsoft.com/', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_public_homepage.png'), fullPage: true });

    const publicNav = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header a, nav a')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })).filter(l => l.text);

      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim()).filter(Boolean);
      return { title: document.title, links, headings: headings.slice(0, 15) };
    });
    inspectionReport.publicSite = publicNav;
    console.log('Public site title:', publicNav.title);
    console.log('Public Nav Links:', publicNav.links);

    // ==========================================
    // 2. STUDENT LOGIN & PORTAL
    // ==========================================
    console.log('\n--- 2. Inspecting Student Portal ---');
    await page.goto('https://lms.innovativeitsoft.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_student_login.png') });

    // Fill student credentials
    console.log('Submitting student login (user@gmail.com)...');
    await page.type('input[type="email"], input[name*="email"], input[placeholder*="email" i]', 'user@gmail.com');
    await page.type('input[type="password"], input[name*="password"]', '12345@');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_student_login_filled.png') });
    
    // Click submit
    const submitBtn = await page.$('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(e => console.log('Nav wait:', e.message)),
        submitBtn.click()
      ]);
    }
    await sleep(3000);
    console.log('Current URL after student login:', page.url());
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_student_dashboard.png'), fullPage: true });

    const studentInfo = await page.evaluate(() => {
      const sidebarLinks = Array.from(document.querySelectorAll('aside a, .sidebar a, nav a, .dashboard-menu a')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })).filter(l => l.text);

      const cards = Array.from(document.querySelectorAll('.card, [class*="card"], [class*="stat"]')).map(c => c.innerText.trim().replace(/\n+/g, ' ')).filter(Boolean);

      return {
        url: window.location.href,
        title: document.title,
        sidebarLinks,
        cards: cards.slice(0, 20)
      };
    });
    inspectionReport.studentPortal = studentInfo;
    console.log('Student Portal URL:', studentInfo.url);
    console.log('Student Sidebar Links:', studentInfo.sidebarLinks);

    // ==========================================
    // 3. ADMIN LOGIN & DASHBOARD
    // ==========================================
    console.log('\n--- 3. Inspecting Admin Portal ---');
    const adminPage = await browser.newPage();
    await adminPage.goto('https://lms.innovativeitsoft.com/ivis-dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    console.log('Admin login URL reached:', adminPage.url());
    await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, '05_admin_login.png') });

    // Check if on login page or dashboard
    const hasEmailField = await adminPage.$('input[type="email"], input[name*="email"], input[type="text"]');
    if (hasEmailField) {
      console.log('Submitting admin login (admin@gmail.com)...');
      await adminPage.type('input[type="email"], input[name*="email"], input[type="text"]', 'admin@gmail.com');
      await adminPage.type('input[type="password"], input[name*="password"]', '12345@');
      await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, '06_admin_login_filled.png') });

      const adminSubmit = await adminPage.$('button[type="submit"], input[type="submit"], button');
      if (adminSubmit) {
        await Promise.all([
          adminPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 25000 }).catch(e => console.log('Admin nav wait:', e.message)),
          adminSubmit.click()
        ]);
      }
    }

    await sleep(3000);
    console.log('Current Admin URL:', adminPage.url());
    await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, '07_admin_dashboard.png'), fullPage: true });

    // Extract all menu items, submenus, and features in admin
    const adminFeatures = await adminPage.evaluate(() => {
      const menuItems = [];
      const links = Array.from(document.querySelectorAll('aside a, .sidebar a, nav a, ul.menu a, .nav-item a, [class*="sidebar"] a'));
      links.forEach(a => {
        const text = a.innerText.trim().replace(/\n+/g, ' ');
        if (text && !text.includes('Logout') && !text.includes('Sign out')) {
          menuItems.push({ text, href: a.href });
        }
      });

      const cards = Array.from(document.querySelectorAll('.card, [class*="card"], [class*="stat"], [class*="widget"]'))
        .map(c => c.innerText.trim().replace(/\n+/g, ' '))
        .filter(t => t.length > 3 && t.length < 200);

      const tables = Array.from(document.querySelectorAll('table th')).map(th => th.innerText.trim()).filter(Boolean);

      return {
        url: window.location.href,
        title: document.title,
        menuItems,
        statCards: cards.slice(0, 20),
        tableHeaders: tables
      };
    });

    inspectionReport.adminPortal = adminFeatures;
    console.log('Admin Menu Items count:', adminFeatures.menuItems.length);
    console.log('Admin Menu Items:', adminFeatures.menuItems);
    console.log('Admin Stat Cards:', adminFeatures.statCards);

    // Save full JSON inspection
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'inspection_report.json'), JSON.stringify(inspectionReport, null, 2));
    console.log('\nInspection report successfully written to:', path.join(ARTIFACT_DIR, 'inspection_report.json'));

  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    await browser.close();
  }
}

runInspection();
