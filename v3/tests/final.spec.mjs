import { expect, test } from '@playwright/test';

async function waitForFinal(page) {
  await page.waitForFunction(() => document.documentElement.dataset.v3Ready === 'true');
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.v3FinalModel));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(350);
}

async function frameFinal(page) {
  await page.evaluate(() => {
    const section = document.querySelector('.final-cta');
    const header = document.querySelector('.site-header');
    const top = section ? section.offsetTop - (header?.offsetHeight || 0) : 0;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(450);
}

function visibleBox(box, viewportWidth = 1600, viewportHeight = 1000) {
  const x = Math.max(0, box.x);
  const y = Math.max(0, box.y);
  return {
    x,
    y,
    width: Math.max(1, Math.min(box.width - Math.max(0, -box.x), viewportWidth - x)),
    height: Math.max(1, Math.min(box.height - Math.max(0, -box.y), viewportHeight - y)),
  };
}

test('Final ceramic callback static desktop 1600x1000', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForFinal(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3FinalModel)).toBe('ready');

  await frameFinal(page);
  await expect(page.locator('#final-canvas')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Found your next breakfast spot?' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get directions' }).last()).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/final-static-desktop-1600x1000.png', fullPage: false });
});

test('Final ceramic callback static mobile 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForFinal(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3FinalModel)).toBe('ready');

  await frameFinal(page);
  await expect(page.locator('#final-canvas')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Found your next breakfast spot?' })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/final-static-mobile-390x844.png', fullPage: false });
});

test('Final callback scrubs Blender settle clips as the section enters', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForFinal(page);

  const clips = await page.evaluate(() => document.documentElement.dataset.v3FinalClips || '');
  expect(clips).toContain('ACT_FINAL_CUP_SETTLE');
  expect(clips).toContain('ACT_FINAL_RECEIPT_SETTLE');
  expect(clips).toContain('ACT_FINAL_SPOON_SETTLE');

  const sectionTop = await page.evaluate(() => document.querySelector('.final-cta').offsetTop);
  await page.evaluate((top) => window.scrollTo({ top: top - window.innerHeight * 0.80, behavior: 'instant' }), sectionTop);
  await page.waitForTimeout(750);

  const canvas = page.locator('#final-canvas');
  const beforeBox = await canvas.boundingBox();
  expect(beforeBox).not.toBeNull();
  const beforeClip = visibleBox(beforeBox);
  expect(beforeClip.width).toBeGreaterThan(100);
  expect(beforeClip.height).toBeGreaterThan(60);
  const before = await page.screenshot({ clip: beforeClip });
  const beforeShift = await page.locator('[data-final-stage]').evaluate((el) => getComputedStyle(el).getPropertyValue('--final-photo-shift'));

  await page.evaluate((top) => window.scrollTo({ top: top - window.innerHeight * 0.20, behavior: 'instant' }), sectionTop);
  await page.waitForTimeout(1100);

  const afterBox = await canvas.boundingBox();
  expect(afterBox).not.toBeNull();
  const afterClip = visibleBox(afterBox);
  expect(afterClip.width).toBeGreaterThan(100);
  expect(afterClip.height).toBeGreaterThan(100);
  const after = await page.screenshot({ clip: afterClip });
  const length = Math.min(before.length, after.length);
  expect(Buffer.compare(before.subarray(0, length), after.subarray(0, length))).not.toBe(0);

  const afterShift = await page.locator('[data-final-stage]').evaluate((el) => getComputedStyle(el).getPropertyValue('--final-photo-shift'));
  expect(afterShift).not.toBe(beforeShift);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/final-motion-mid-1600x1000.png', fullPage: false });
});

test('Final callback falls back to real coffee and semantic CTA', async ({ page }) => {
  await page.route('**/models/manic-final.glb', (route) => route.abort());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForFinal(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3FinalModel)).toBe('fallback');

  await frameFinal(page);
  await expect(page.locator('.final-real-photo img')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Found your next breakfast spot?' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get directions' }).last()).toBeVisible();
  await expect(page.locator('.final-fallback-note')).toBeVisible();
});
