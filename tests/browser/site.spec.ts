import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

test('Israel opens Hebrew, elsewhere opens English, explicit choice persists', async ({ browser }) => {
  const israel = await browser.newContext({ timezoneId: 'Asia/Jerusalem', locale: 'en-US' });
  const israelPage = await israel.newPage();
  await israelPage.goto('/');
  await expect(israelPage).toHaveURL(/\/he$/);
  await expect(israelPage.locator('html')).toHaveAttribute('dir', 'rtl');
  await israelPage.getByRole('link', { name: 'Switch to English' }).click();
  await expect(israelPage).toHaveURL(/\/en$/);
  await israelPage.goto('/');
  await expect(israelPage).toHaveURL(/\/en$/);
  await israel.close();
  const london = await browser.newContext({ timezoneId: 'Europe/London', locale: 'he-IL' });
  const londonPage = await london.newPage();
  await londonPage.goto('/');
  await expect(londonPage).toHaveURL(/\/en$/);
  await london.close();
});

for (const locale of ['he', 'en'] as const) {
  test(`${locale}: routes, SEO, anchors and complete copy`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.practice-card')).toHaveCount(6);
    await page.locator('.practice-card').first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/practice#real-estate$`));
    await expect(page.locator('#real-estate')).toBeInViewport();
    await expect(page.locator('.practice-detail')).toHaveCount(7);
    await expect(page.locator('.practice-detail li')).toHaveCount(37);
    await page.locator('.practice-sidebar a').last().click();
    await expect(page.locator('#litigation')).toBeInViewport();
    await page.getByRole('link', { name: locale === 'he' ? 'Switch to English' : 'מעבר לעברית' }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale === 'he' ? 'en' : 'he'}/practice#litigation$`));
    await expect(page.locator('#litigation')).toBeInViewport();
    for (const route of ['about', 'contact', 'privacy', 'terms', 'accessibility']) {
      await page.goto(`/${locale}/${route}`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page).not.toHaveTitle('');
      await expect(page.locator('main')).not.toContainText('[Button:');
      await expect(page.locator('main')).not.toContainText('[כפתור:');
    }
    await page.goto(`/${locale}/unavailable`);
    await expect(page.locator('h1')).toHaveText(locale === 'he' ? 'העמוד לא נמצא' : 'Page not found');
  });

  test(`${locale}: contact validates, prepares only a draft, and preserves edits`, async ({ page }) => {
    const submissions: string[] = [];
    page.on('request', (request) => { if (request.method() === 'POST') submissions.push(request.url()); });
    await page.goto(`/${locale}/contact?subject=finance`);
    await expect(page.locator('#subject')).toHaveValue('finance');
    await page.locator('button[type="submit"]').click();
    await expect(page.getByRole('alert')).toBeVisible();
    await page.locator('#full-name').fill('Local Test / בדיקה מקומית');
    await page.locator('#phone').fill('---');
    await page.locator('#email').fill('local@example.test');
    await page.locator('#message').fill('Local test only. No delivery.');
    await page.locator('#consent').check();
    await page.locator('button[type="submit"]').click();
    await expect(page.getByRole('alert')).toBeVisible();
    await page.locator('#phone').fill('0543030283');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.draft-panel')).toBeVisible();
    await expect(page.locator('#email-draft')).toContainText('Local Test');
    const href = await page.locator('.draft-panel .button').getAttribute('href');
    expect(href).toMatch(/^mailto:yosi@zarabi-law.com\?/);
    expect(new URL(href!).searchParams.get('body')).toContain('Local test only. No delivery.');
    await page.locator('.draft-panel .text-button').click();
    await expect(page.locator('#message')).toHaveValue('Local test only. No delivery.');
    expect(submissions).toEqual([]);
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  });
}

test('mobile navigation is keyboard accessible, closes, and never overflows', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const locale of ['he', 'en']) {
    await page.goto(`/${locale}`);
    const menu = page.locator('.menu-toggle');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.mobile-menu a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click();
    await page.locator('.mobile-menu nav a').nth(1).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/about$`));
    await expect(page.locator('.mobile-menu')).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    for (const path of ['', '/about', '/practice', '/contact', '/privacy']) {
      await page.goto(`/${locale}${path}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
});

test('browser sessions load locally only and have no runtime errors', async ({ page }) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.hostname !== '127.0.0.1') external.push(url.href);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['he', 'en']) {
    for (const route of ['', '/about', '/practice', '/contact', '/privacy', '/terms', '/accessibility']) {
      await page.goto(`/${locale}${route}`);
      await page.evaluate(() => document.fonts.ready);
    }
  }
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test('reduced motion disables transforms and content remains visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/he');
  await page.evaluate(() => window.scrollTo(0, 1000));
  expect(await page.locator('[data-parallax]').first().evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  expect(await page.locator('[data-reveal]').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  expect(await page.locator('.hero h1 > span').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

test('desktop and mobile accessibility checks for both languages', async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const violations = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const locale of ['he', 'en']) {
      for (const route of ['', '/about', '/practice', '/contact', '/privacy', '/terms', '/accessibility']) {
        await page.goto(`/${locale}${route}`);
        await page.evaluate(() => document.fonts.ready);
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        for (const violation of result.violations) {
          violations.push({ width, route: `/${locale}${route}`, rule: violation.id, nodes: violation.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })) });
        }
      }
    }
  }
  expect(violations).toEqual([]);
});

test('capture local design previews', async ({ page }) => {
  await mkdir('previews', { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['he', 'en']) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/${locale}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `previews/${locale}-desktop.png`, fullPage: true });
    await page.screenshot({ path: `previews/${locale}-hero.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `previews/${locale}-mobile.png`, fullPage: true });
    await page.screenshot({ path: `previews/${locale}-mobile-hero.png` });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/he/contact');
  await page.screenshot({ path: 'previews/he-contact.png', fullPage: true });
});

test('native scroll drives parallax, reveals and sticky chapter progress', async ({ page }) => {
  await page.goto('/he');
  const illustration = page.locator('[data-parallax]').first();
  const initial = await illustration.evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.wheel(0, 350);
  await expect.poll(() => illustration.evaluate((element) => getComputedStyle(element).transform)).not.toBe(initial);
  await page.locator('#introduction').scrollIntoViewIfNeeded();
  await expect(page.locator('.intro-body')).toHaveClass(/revealed/);
  await page.locator('[data-step="2"]').scrollIntoViewIfNeeded();
  await expect(page.locator('.chapter-number')).toHaveText('03');
  const sticky = await page.locator('.approach-sticky').boundingBox();
  expect(sticky?.y).toBeGreaterThanOrEqual(100);
  expect(sticky?.y).toBeLessThan(220);
  const progress = await page.locator('.reading-progress').evaluate((element) => getComputedStyle(element).transform);
  expect(progress).not.toBe('matrix(0, 0, 0, 1, 0, 0)');
});

test('small phones, tablets and zoom-width layouts keep content inside the viewport', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 600, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const locale of ['he', 'en']) {
      for (const route of ['', '/about', '/practice', '/contact']) {
        await page.goto(`/${locale}${route}`);
        await page.evaluate(() => document.fonts.ready);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${width}px /${locale}${route}`).toBe(true);
        if (route === '') {
          const heroBounds = await page.locator('.hero-copy').boundingBox();
          const buttonBounds = await page.locator('.hero-copy > .button').boundingBox();
          expect(buttonBounds!.y + buttonBounds!.height).toBeLessThanOrEqual(heroBounds!.y + heroBounds!.height);
        }
      }
    }
  }
});

test('official logos and clean local brand fonts render in both languages', async ({ page }) => {
  for (const locale of ['he', 'en']) {
    await page.goto(`/${locale}`);
    await page.evaluate(() => document.fonts.ready);
    const logo = page.locator('.site-header .brand-logo-light');
    await expect(logo).toBeVisible();
    expect(await logo.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.locator('h1').evaluate((element) => getComputedStyle(element).fontFamily)).toContain(locale === 'he' ? 'Heebo Variable' : 'Poppins Brand');
    await page.goto(`/${locale}/about`);
    await expect(page.locator('.site-header .brand-logo-dark')).toBeVisible();
    await expect(page.locator('.site-header .brand-logo-light')).toBeHidden();
  }
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())).toBe('#24408c');
});

test('the sculpture animates, can be paused, resumes and stops offscreen', async ({ page }) => {
  await page.goto('/he');
  const scene = page.locator('.signature-scene');
  const snapshot = () => page.locator('.signature-scene canvas').evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  await expect(scene).toHaveAttribute('data-state', 'running');
  const initial = await snapshot();
  await expect.poll(snapshot).not.toBe(initial);
  await page.getByRole('button', { name: 'עצירת תנועה', exact: true }).click();
  await expect(scene).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('.site')).toHaveAttribute('data-motion', 'paused');
  const stopped = await snapshot();
  await page.waitForTimeout(200);
  expect(await snapshot()).toBe(stopped);
  await page.getByRole('button', { name: 'הפעלת תנועה', exact: true }).click();
  await expect(scene).toHaveAttribute('data-state', 'running');
  await expect.poll(snapshot).not.toBe(stopped);
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-state', 'offscreen');
});

test('scroll illuminates the statement and pointer interaction lights up practice cards', async ({ page }) => {
  await page.goto('/he');
  const statement = page.locator('.signature-statement');
  await statement.evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' }));
  await expect.poll(() => page.locator('[data-word].is-lit').count()).toBeGreaterThan(0);
  const beginning = await page.locator('[data-word].is-lit').count();
  await statement.evaluate((element) => window.scrollBy({ top: (element.clientHeight - window.innerHeight + 80) * 0.9, behavior: 'instant' }));
  await expect.poll(() => page.locator('[data-word].is-lit').count()).toBeGreaterThan(beginning);
  const stage = await page.locator('.statement-stage').boundingBox();
  expect(stage!.y).toBeGreaterThanOrEqual(75);
  expect(stage!.y).toBeLessThanOrEqual(90);
  const card = page.locator('.practice-card').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/revealed/);
  const bounds = await card.boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width * 0.3, bounds!.y + bounds!.height * 0.3);
  await expect.poll(() => card.evaluate((element) => element.style.getPropertyValue('--spot-opacity'))).toBe('1');
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');
  await page.mouse.move(0, 0);
  await expect.poll(() => card.evaluate((element) => element.style.getPropertyValue('--spot-opacity'))).toBe('0');
});

test('reduced motion and unavailable canvas retain a complete usable design', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/he');
  await expect(page.locator('.signature-scene')).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('.motion-control')).toBeDisabled();
  await expect(page.locator('[data-word]:not(.is-lit)')).toHaveCount(0);
  expect(await page.locator('.statement-stage').evaluate((element) => getComputedStyle(element).position)).toBe('relative');
  await context.close();

  const fallback = await browser.newContext();
  const fallbackPage = await fallback.newPage();
  await fallbackPage.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await fallbackPage.goto('/en');
  await expect(fallbackPage.locator('.signature-scene')).toHaveAttribute('data-renderer', 'static');
  await expect(fallbackPage.locator('.scene-fallback')).toBeVisible();
  await expect(fallbackPage.locator('h1')).toContainText('Legal precision.');
  await expect(fallbackPage.locator('.hero-copy > .button')).toBeVisible();
  await fallback.close();
});
