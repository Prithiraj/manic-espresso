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

test('desktop WebGL scene changes on scroll when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForRender(page);

  const canvas = page.locator('#scene-canvas');
  await expect(canvas).toBeVisible();

  const beforeBox = await canvas.boundingBox();
  expect(beforeBox).not.toBeNull();
  const before = await page.screenshot({ clip: beforeBox });

  await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
  await page.waitForTimeout(700);

  const afterBox = await canvas.boundingBox();
  expect(afterBox).not.toBeNull();
  const visibleAfterBox = {
    x: Math.max(0, afterBox.x),
    y: Math.max(0, afterBox.y),
    width: Math.min(afterBox.width, 1600 - Math.max(0, afterBox.x)),
    height: Math.min(afterBox.height, 1000 - Math.max(0, afterBox.y))
  };
  expect(visibleAfterBox.width).toBeGreaterThan(100);
  expect(visibleAfterBox.height).toBeGreaterThan(100);

  const after = await page.screenshot({ clip: visibleAfterBox });
  expect(Buffer.compare(before.subarray(0, Math.min(before.length, after.length)), after.subarray(0, Math.min(before.length, after.length)))).not.toBe(0);

  await page.screenshot({
    path: 'qa-screenshots/desktop-scroll-1600x1000.png',
    fullPage: false
  });
});
