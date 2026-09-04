import { mkdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

mkdirSync('qa-screenshots', { recursive: true });

async function waitForReady(page) {
  await page.waitForFunction(() => document.documentElement.dataset.v3Ready === 'true');
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.v3Model));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(250);
}

test('hero static desktop 1600x1000', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForReady(page);

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#hero-canvas')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.dataset.v3Model)).toBe('ready');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    path: 'qa-screenshots/hero-desktop-1600x1000.png',
    fullPage: false
  });
});

test('hero static mobile 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForReady(page);

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#hero-canvas')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.dataset.v3Model)).toBe('ready');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    path: 'qa-screenshots/hero-mobile-390x844.png',
    fullPage: false
  });
});

test('WebGL fallback remains complete if the model is unavailable', async ({ page }) => {
  await page.route('**/models/manic-hero.glb', (route) => route.abort());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForReady(page);

  expect(await page.evaluate(() => document.documentElement.dataset.v3Model)).toBe('fallback');
  await expect(page.locator('.model-fallback')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get directions' }).first()).toBeVisible();
});
