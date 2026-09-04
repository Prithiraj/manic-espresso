import { expect, test } from '@playwright/test';

async function waitForReview(page) {
  await page.waitForFunction(() => document.documentElement.dataset.v3Ready === 'true');
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.v3ReviewModel));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(350);
}

async function frameReview(page) {
  await page.evaluate(() => {
    const section = document.getElementById('reviews');
    const header = document.querySelector('.site-header');
    const top = section ? section.offsetTop - (header?.offsetHeight || 0) : 0;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(500);
}

async function frameReviewEntering(page) {
  await page.evaluate(() => {
    const section = document.getElementById('reviews');
    if (!section) return;
    const top = section.offsetTop - window.innerHeight * 0.78;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(700);
}

test('Review paper static desktop 1600x1000', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForReview(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3ReviewModel)).toBe('ready');

  await frameReview(page);
  const section = page.locator('#reviews');
  await expect(section.getByRole('heading', { name: 'Friendly. Generous. Peaceful.' })).toBeVisible();
  await expect(section.locator('#review-canvas')).toBeVisible();
  const clips = await page.evaluate(() => document.documentElement.dataset.v3ReviewClips || '');
  expect(clips).toContain('ACT_REVIEW_PAPER_TURN');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/review-static-desktop-1600x1000.png', fullPage: false });
});

test('Review paper static mobile 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForReview(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3ReviewModel)).toBe('ready');

  await frameReview(page);
  const section = page.locator('#reviews');
  await expect(section.getByRole('heading', { name: 'Friendly. Generous. Peaceful.' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/review-static-mobile-390x844.png', fullPage: false });
});

test('Review paper turns into its settled state on scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForReview(page);
  await frameReviewEntering(page);

  const stage = page.locator('[data-review-stage]');
  const before = Number(await stage.getAttribute('data-review-progress') || 0);
  expect(before).toBeLessThan(0.55);

  await page.evaluate(() => window.scrollBy({ top: 430, behavior: 'instant' }));
  await page.waitForTimeout(950);
  const after = Number(await stage.getAttribute('data-review-progress') || 0);
  expect(after).toBeGreaterThan(before + 0.20);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/review-motion-mid-1600x1000.png', fullPage: false });
});

test('Review section falls back to semantic sentiment if GLB fails', async ({ page }) => {
  await page.route('**/models/manic-review.glb', (route) => route.abort());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForReview(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3ReviewModel)).toBe('fallback');

  await frameReview(page);
  const section = page.locator('#reviews');
  await expect(section.getByRole('heading', { name: 'Friendly. Generous. Peaceful.' })).toBeVisible();
  await expect(section.getByRole('link', { name: /See current Google reviews/ })).toBeVisible();
  await expect(section.locator('.review-fallback-note')).toBeVisible();
});
