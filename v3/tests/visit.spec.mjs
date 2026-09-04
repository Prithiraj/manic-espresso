import { expect, test } from '@playwright/test';

async function waitForVisit(page) {
  await page.waitForFunction(() => document.documentElement.dataset.v3Ready === 'true');
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.v3VisitModel));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(350);
}

async function frameVisit(page) {
  await page.evaluate(() => {
    const section = document.getElementById('visit');
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

test('Visit location token static desktop 1600x1000', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForVisit(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3VisitModel)).toBe('ready');

  const visit = page.locator('#visit');
  await frameVisit(page);
  await expect(visit.locator('#visit-canvas')).toBeVisible();
  await expect(visit.getByRole('heading', { name: 'Find Manic on Murray Street.' })).toBeVisible();
  await expect(visit.locator('address').getByText('27 Murray St', { exact: true })).toBeVisible();
  await expect(visit.getByText('Monday–Saturday', { exact: true })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/visit-static-desktop-1600x1000.png', fullPage: false });
});

test('Visit location token static mobile 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForVisit(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3VisitModel)).toBe('ready');

  const visit = page.locator('#visit');
  await frameVisit(page);
  await expect(visit.getByRole('heading', { name: 'Find Manic on Murray Street.' })).toBeVisible();
  await expect(visit.locator('address').getByText('27 Murray St', { exact: true })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/visit-static-mobile-390x844.png', fullPage: false });

  await page.evaluate(() => {
    const stage = document.querySelector('[data-visit-stage]');
    const header = document.querySelector('.site-header');
    const top = stage ? stage.offsetTop + stage.parentElement.offsetTop - (header?.offsetHeight || 0) - 18 : 0;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(450);
  await expect(visit.locator('#visit-canvas')).toBeVisible();
  await page.screenshot({ path: 'qa-screenshots/visit-static-mobile-stage-390x844.png', fullPage: false });
});

test('Visit token scrubs pin and paper motion while preserving the address layer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForVisit(page);

  const clips = await page.evaluate(() => document.documentElement.dataset.v3VisitClips || '');
  expect(clips).toContain('ACT_VISIT_PIN_RISE');
  expect(clips).toContain('ACT_VISIT_PAPER_SPREAD_2');
  expect(clips).toContain('ACT_VISIT_PAPER_SPREAD_3');

  const sectionTop = await page.evaluate(() => document.getElementById('visit').offsetTop);
  await page.evaluate((top) => window.scrollTo({ top: top - window.innerHeight * 0.72, behavior: 'instant' }), sectionTop);
  await page.waitForTimeout(750);

  const canvas = page.locator('#visit-canvas');
  const beforeBox = await canvas.boundingBox();
  expect(beforeBox).not.toBeNull();
  const beforeClip = visibleBox(beforeBox);
  expect(beforeClip.width).toBeGreaterThan(100);
  expect(beforeClip.height).toBeGreaterThan(80);
  const before = await page.screenshot({ clip: beforeClip });
  const beforeShift = await page.locator('[data-visit-stage]').evaluate((el) => getComputedStyle(el).getPropertyValue('--visit-photo-shift'));

  await page.evaluate((top) => window.scrollTo({ top: top - window.innerHeight * 0.14, behavior: 'instant' }), sectionTop);
  await page.waitForTimeout(1100);

  const afterBox = await canvas.boundingBox();
  expect(afterBox).not.toBeNull();
  const afterClip = visibleBox(afterBox);
  expect(afterClip.width).toBeGreaterThan(100);
  expect(afterClip.height).toBeGreaterThan(100);
  const after = await page.screenshot({ clip: afterClip });
  const length = Math.min(before.length, after.length);
  expect(Buffer.compare(before.subarray(0, length), after.subarray(0, length))).not.toBe(0);

  const afterShift = await page.locator('[data-visit-stage]').evaluate((el) => getComputedStyle(el).getPropertyValue('--visit-photo-shift'));
  expect(afterShift).not.toBe(beforeShift);
  await expect(page.locator('#visit address').getByText('27 Murray St', { exact: true })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/visit-motion-mid-1600x1000.png', fullPage: false });
});

test('Visit location token falls back to real exterior and semantic contact details', async ({ page }) => {
  await page.route('**/models/manic-visit.glb', (route) => route.abort());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForVisit(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3VisitModel)).toBe('fallback');

  const visit = page.locator('#visit');
  await frameVisit(page);
  await expect(visit.locator('.visit-real-photo img')).toBeVisible();
  await expect(visit.locator('address').getByText('27 Murray St', { exact: true })).toBeVisible();
  await expect(visit.getByRole('link', { name: '0401 866 609' })).toBeVisible();
  await expect(visit.locator('.visit-fallback-note')).toBeVisible();
});
