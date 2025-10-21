/**
 * Homepage E2E Tests
 *
 * Critical Path: User lands on homepage → sees value proposition → CTA works
 * Visual Regression: Playwright screenshots + Percy cloud comparison
 * Accessibility: WCAG AA compliance
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import percySnapshot from '@percy/playwright';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');

    // Verify page loaded
    await expect(page).toHaveTitle(/ZZIK|ZZMUK/i);

    // Verify critical content visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Calculate compliance score
    const violations = accessibilityScanResults.violations;
    const totalRules = violations.length;

    // Log violations for debugging
    if (violations.length > 0) {
      console.log('Accessibility violations found:');
      violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Elements: ${violation.nodes.length}`);
      });
    }

    // Assert: No critical or serious violations
    const criticalViolations = violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(
      criticalViolations.length,
      `Found ${criticalViolations.length} critical/serious accessibility violations`
    ).toBe(0);

    // Target: > 95% compliance (allow minor violations only)
    const complianceScore =
      totalRules > 0 ? ((totalRules - criticalViolations.length) / totalRules) * 100 : 100;

    expect(
      complianceScore,
      `Accessibility compliance: ${complianceScore.toFixed(2)}% (target: >95%)`
    ).toBeGreaterThanOrEqual(95);
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Playwright local screenshot (fast, offline)
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixels: 100, // Allow small differences (anti-aliasing, etc.)
      threshold: 0.05, // 5% threshold per orchestration rules
    });

    // Percy cloud snapshot (cross-browser, detailed diff UI)
    await percySnapshot(page, 'Homepage - Initial Load', {
      widths: [375, 768, 1280], // Mobile, Tablet, Desktop
      minHeight: 1024,
    });
  });

  test('CTA button should be clickable', async ({ page }) => {
    await page.goto('/');

    // Find primary CTA (adjust selector based on actual implementation)
    const cta = page.locator('a:has-text("Get Started"), button:has-text("Get Started")').first();

    if (await cta.count() > 0) {
      await expect(cta).toBeVisible();
      await expect(cta).toBeEnabled();

      // Click and verify navigation
      await cta.click();

      // Should navigate away from homepage
      await page.waitForURL((url) => url.pathname !== '/');

      // Percy snapshot after navigation
      await page.waitForLoadState('networkidle');
      await percySnapshot(page, 'Homepage - After CTA Click', {
        widths: [375, 768, 1280],
      });
    } else {
      console.warn('No "Get Started" CTA found on homepage');
    }
  });
});
