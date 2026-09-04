import { expect, test } from '@playwright/test';

async function waitForSite(page) {
  await page.waitForFunction(() => document.documentElement.dataset.v3Ready === 'true');
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.v3CafeModel));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
}

test('Cafe miniature static desktop 1600x1000', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForSite(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3CafeModel)).toBe('ready');

  await page.locator('#place').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(page.locator('#cafe-canvas')).toBeVisible();
  await expect(page.getByText('The real place still matters most.')).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/cafe-static-desktop-1600x1000.png', fullPage: false });
});

test('Cafe miniature static mobile 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForSite(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3CafeModel)).toBe('ready');

  await page.locator('#place').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(page.locator('#cafe-canvas')).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/cafe-static-mobile-390x844.png', fullPage: false });
});

test('Cafe miniature falls back to real place photography', async ({ page }) => {
  await page.route('**/models/manic-cafe.glb', (route) => route.abort());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForSite(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3CafeModel)).toBe('fallback');

  await page.locator('#place').scrollIntoViewIfNeeded();
  await expect(page.locator('.place-photos img').first()).toBeVisible();
  await expect(page.locator('.place-photos img').nth(1)).toBeVisible();
  await expect(page.locator('.cafe-fallback-note')).toBeVisible();
});
