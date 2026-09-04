import { mkdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

mkdirSync('qa-screenshots', { recursive: true });

async function waitForRender(page) {
  await page.waitForFunction(() => document.documentElement.dataset.siteReady === 'true');
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.sceneReady));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(250);
}

test('desktop static frame 1600x1000', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForRender(page);

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#scene-canvas')).toBeVisible();
  await expect(page.locator('.photo-card-main img')).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    path: 'qa-screenshots/desktop-1600x1000.png',
    fullPage: false
  });
});

test('mobile static frame 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForRender(page);

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.mobile-actions')).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    path: 'qa-screenshots/mobile-390x844.png',
    fullPage: false
  });
});
