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

test('Cafe scrubs Blender cutaway and yields toward interior photography', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForSite(page);

  const clips = await page.evaluate(() => document.documentElement.dataset.v3CafeClips || '');
  expect(clips).toContain('ACT_CAFE_CUTAWAY_FACADE');

  const placeTop = await page.evaluate(() => document.getElementById('place').offsetTop);
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), placeTop);
  await page.waitForTimeout(700);

  const canvas = page.locator('#cafe-canvas');
  const beforeBox = await canvas.boundingBox();
  expect(beforeBox).not.toBeNull();
  const before = await page.screenshot({ clip: beforeBox });
  const beforeInteriorOpacity = await page.locator('.place-photos img').nth(1).evaluate((el) => getComputedStyle(el).opacity);

  await page.evaluate((top) => window.scrollTo({ top: top + 620, behavior: 'instant' }), placeTop);
  await page.waitForTimeout(1100);

  const afterBox = await canvas.boundingBox();
  expect(afterBox).not.toBeNull();
  const visible = {
    x: Math.max(0, afterBox.x),
    y: Math.max(0, afterBox.y),
    width: Math.min(afterBox.width, 1600 - Math.max(0, afterBox.x)),
    height: Math.min(afterBox.height, 1000 - Math.max(0, afterBox.y))
  };
  expect(visible.width).toBeGreaterThan(100);
  expect(visible.height).toBeGreaterThan(100);

  const after = await page.screenshot({ clip: visible });
  const length = Math.min(before.length, after.length);
  expect(Buffer.compare(before.subarray(0, length), after.subarray(0, length))).not.toBe(0);

  const afterInteriorOpacity = await page.locator('.place-photos img').nth(1).evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(afterInteriorOpacity)).toBeGreaterThan(Number(beforeInteriorOpacity));

  await page.screenshot({ path: 'qa-screenshots/cafe-cutaway-mid-1600x1000.png', fullPage: false });
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
