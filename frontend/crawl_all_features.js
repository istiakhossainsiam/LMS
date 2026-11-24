import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\istia\\.gemini\\antigravity\\brain\\12b26a79-087c-4a4f-91f1-c0c31ed1f6a0\\lms_inspection';

async function crawl() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const fullAnalysis = {
    platformName: "TrainingPundit (Training Pundit)",
    referenceBrand: "Shikkha Point (innovativeitsoft)",
    studentFeatures: {},
    adminFeatures: {}
  };

  // 1. Student Session
  const studentPage = await browser.newPage();
  await studentPage.goto('https://lms.innovativeitsoft.com/login', { waitUntil: 'networkidle2' });
  await studentPage.evaluate(() => {
    document.querySelector('#email').value = 'user@gmail.com';
    document.querySelector('#password').value = '12345@';
    document.querySelector('form').submit();
  });
  await new Promise(r => setTimeout(r, 4000));

  const studentUrls = [
    { key: 'dashboard', url: 'https://lms.innovativeitsoft.com/dashboard', title: 'Student Dashboard' },
    { key: 'myCourses', url: 'https://lms.innovativeitsoft.com/my-courses', title: 'My Enrolled Courses' },
    { key: 'myBooks', url: 'https://lms.innovativeitsoft.com/my-books', title: 'My Books' },
    { key: 'orderHistory', url: 'https://lms.innovativeitsoft.com/order-history', title: 'Order History' },
    { key: 'savedVideos', url: 'https://lms.innovativeitsoft.com/saved-videos', title: 'Saved Videos' },
    { key: 'exams', url: 'https://lms.innovativeitsoft.com/exams', title: 'Online Exams' },
    { key: 'certificates', url: 'https://lms.innovativeitsoft.com/my-certificates', title: 'Certificates' },
    { key: 'profile', url: 'https://lms.innovativeitsoft.com/profile', title: 'Profile Settings' }
  ];

  for (const item of studentUrls) {
    try {
      await studentPage.goto(item.url, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 1000));
      const shotPath = path.join(ARTIFACT_DIR, `student_${item.key}.png`);
      await studentPage.screenshot({ path: shotPath });

      const details = await studentPage.evaluate(() => {
        return {
          title: document.title,
          heading: document.querySelector('h1, h2, h3')?.innerText.trim(),
          tables: Array.from(document.querySelectorAll('table th')).map(th => th.innerText.trim()).filter(Boolean),
          buttons: Array.from(document.querySelectorAll('button, a.btn')).map(b => b.innerText.trim()).filter(t => t.length > 2 && t.length < 30),
          snippet: document.body.innerText.replace(/\n+/g, ' ').slice(0, 400)
        };
      });
      fullAnalysis.studentFeatures[item.key] = { ...item, ...details };
      console.log(`[Student] Crawled: ${item.title}`);
    } catch (e) {
      console.log(`[Student] Error on ${item.url}:`, e.message);
    }
  }

  // 2. Admin Session
  const adminPage = await browser.newPage();
  await adminPage.goto('https://lms.innovativeitsoft.com/ivis-dashboard/login', { waitUntil: 'networkidle2' });
  await adminPage.type('input[type="email"], input[name="email"], input[type="text"]', 'admin@gmail.com');
  await adminPage.type('input[type="password"]', '12345@');
  const btn = await adminPage.$('button[type="submit"]');
  if (btn) await btn.click();
  await new Promise(r => setTimeout(r, 4000));

  const adminUrls = [
    { key: 'dashboard', url: 'https://lms.innovativeitsoft.com/ivis-dashboard', title: 'Admin Overview & Analytics' },
    { key: 'courses', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/course', title: 'All Courses' },
    { key: 'categories', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/category', title: 'Course Categories' },
    { key: 'modules', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/module', title: 'Modules' },
    { key: 'questionBank', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/question-bank', title: 'Question Bank' },
    { key: 'quizzes', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/quiz', title: 'Quiz Management' },
    { key: 'exams', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/exam', title: 'Exam Builder' },
    { key: 'enrollments', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/enrollments', title: 'Enroll Management' },
    { key: 'certificates', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/certificates', title: 'Certificates Registry' },
    { key: 'pos', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/pos', title: 'POS System (Offline/Direct Sale)' },
    { key: 'books', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/book', title: 'Book Store' },
    { key: 'instructors', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/instructor', title: 'Instructors / Trainers' },
    { key: 'coupons', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/coupons', title: 'Discount Coupons' },
    { key: 'earnings', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/earnings/dashboard', title: 'Earnings Dashboard' },
    { key: 'orders', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/orders', title: 'All Orders' },
    { key: 'payments', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/payments', title: 'Payment Verification' },
    { key: 'users', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/user', title: 'User Management' },
    { key: 'generalSettings', url: 'https://lms.innovativeitsoft.com/ivis-dashboard/setting/general', title: 'General Settings' }
  ];

  for (const item of adminUrls) {
    try {
      await adminPage.goto(item.url, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 1000));
      const shotPath = path.join(ARTIFACT_DIR, `admin_${item.key}.png`);
      await adminPage.screenshot({ path: shotPath });

      const details = await adminPage.evaluate(() => {
        return {
          title: document.title,
          heading: document.querySelector('h1, h2, h3')?.innerText.trim(),
          tables: Array.from(document.querySelectorAll('table th')).map(th => th.innerText.trim()).filter(Boolean),
          buttons: Array.from(document.querySelectorAll('button, a.btn')).map(b => b.innerText.trim()).filter(t => t.length > 2 && t.length < 30),
          snippet: document.body.innerText.replace(/\n+/g, ' ').slice(0, 400)
        };
      });
      fullAnalysis.adminFeatures[item.key] = { ...item, ...details };
      console.log(`[Admin] Crawled: ${item.title}`);
    } catch (e) {
      console.log(`[Admin] Error on ${item.url}:`, e.message);
    }
  }

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'full_feature_inventory.json'), JSON.stringify(fullAnalysis, null, 2));
  console.log('\nFeature crawl complete! Saved to full_feature_inventory.json');

  await browser.close();
}

crawl();
