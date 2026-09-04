import { expect, test } from '@playwright/test';

async function waitForWhy(page) {
  await page.waitForFunction(() => document.documentElement.dataset.v3Ready === 'true');
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.v3WhyModel));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(350);
}

test('Why Manic Blender still lifes static desktop 1600x1000', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForWhy(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3WhyModel)).toBe('ready');

  await page.locator('.why').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await expect(page.locator('#why-canvas')).toBeVisible();
  await expect(page.getByText('Generous plates')).toBeVisible();
  await expect(page.getByText('A warm welcome')).toBeVisible();
  await expect(page.getByText('A quiet local find')).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/why-static-desktop-1600x1000.png', fullPage: false });
});

test('Why Manic Blender still lifes static mobile 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForWhy(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3WhyModel)).toBe('ready');

  await page.locator('.why').scrollIntoViewIfNeeded();
  await page.waitForTimeout(450);
  await expect(page.locator('#why-canvas')).toBeVisible();
  await expect(page.getByText('Generous plates')).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/why-static-mobile-390x844.png', fullPage: false });
});

test('Why Manic falls back to HTML copy if GLB fails', async ({ page }) => {
  await page.route('**/models/manic-why.glb', (route) => route.abort());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForWhy(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3WhyModel)).toBe('fallback');

  await page.locator('.why').scrollIntoViewIfNeeded();
  await expect(page.getByText('Generous plates')).toBeVisible();
  await expect(page.getByText('A warm welcome')).toBeVisible();
  await expect(page.getByText('A quiet local find')).toBeVisible();
  await expect(page.locator('.why-fallback-note')).toBeVisible();
});
