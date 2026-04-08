const { chromium } = require('playwright');
async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const EMAIL = 'Rongcon96hd@gmail.com';
  const PASSWORD = 'Gcp12345678$';
  await page.goto('https://learn.gcpstudyhub.com/users/sign_in', { timeout: 60000 });
  await page.fill('input[type="email"], #user_email', EMAIL);
  await page.fill('input[type="password"], #user_password', PASSWORD);
  await page.click('button:has-text("Sign in"), input[type="submit"]');
  await page.waitForTimeout(8000);
  
  const courses = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.innerText + " | " + a.href).filter(l => l.match(/course/i));
  });
  courses.forEach(c => console.log(c));
  await browser.close();
}
main();
