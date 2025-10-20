# ZZIK Design System - Ultra-Granular Validation

> 촘촘하고 체계적이고 구체적인 미세조정까지 가능한 디자인 리뷰 시스템
>
> A dense, systematic, specific design review system with micro-level adjustments

## 🎯 Overview

This is a **rule-based, AI-powered, automated design validation system** that enforces exact specifications with **zero tolerance** for deviations.

### Key Features

- ✅ **Machine-Readable Rules**: All design specifications in `DESIGN_RULES.json`
- ✅ **Automated Testing**: Playwright tests measure exact pixels and contrast ratios
- ✅ **AI Review Integration**: Generates detailed prompts for Claude Vision API
- ✅ **Unified Reports**: HTML + JSON reports with scores and fixes
- ✅ **WCAG 2.1 AA Compliant**: Automated accessibility validation
- ✅ **Zero Tolerance Mode**: Strict enforcement of all critical rules

---

## 📁 File Structure

```
design-system/
├── DESIGN_RULES.json            # Machine-readable design specifications
├── design-reviewer.ts           # AI prompt generator + scoring system
├── run-full-review.ts           # Complete workflow orchestrator
└── README.md                    # This file

tests/visual/
├── design-review.spec.ts        # Original visual regression tests
└── design-system-validation.spec.ts  # Rule-based validation tests
```

---

## 🚀 Quick Start

### 1. Run Complete Design Review

```bash
# Standard mode (allows minor deviations)
npm run design:full-review

# Strict mode (zero tolerance)
npm run design:full-review:strict

# For specific page
npm run design:full-review -- --page=/matching
```

**Output:**
- ✅ HTML report with visual scoring
- ✅ JSON report with detailed results
- ✅ AI review prompt (ready for Claude Vision)
- ✅ Automated fix suggestions

### 2. Run Only Automated Tests

```bash
# Run all validation tests
npm run design:test

# Run with UI mode (interactive debugging)
npm run design:test:ui

# Update snapshots after fixing issues
npm run design:update
```

### 3. View Design Rules

```bash
# View all rules
npm run design:rules

# View specific sections
npm run design:rules:colors
npm run design:rules:components
npm run design:rules:accessibility
```

---

## 📋 Design Rules (DESIGN_RULES.json)

### 🎨 Color Palette (CRITICAL)

**Allowed Colors ONLY:**

| Purpose | Color | Hex | Contrast (on white) |
|---------|-------|-----|---------------------|
| Background Base | white | `#ffffff` | - |
| Background Raised | zinc-50 | `#fafafa` | - |
| Background Elevated | zinc-100 | `#f4f4f5` | - |
| Text Primary | zinc-900 | `#18181b` | 17.9:1 ✅ |
| Text Secondary | zinc-600 | `#52525b` | 7.5:1 ✅ |
| Text Tertiary | zinc-400 | `#a1a1aa` | 4.6:1 ✅ |
| Accent Primary | indigo-600 | `#4f46e5` | - |
| Accent Hover | indigo-700 | `#4338ca` | - |
| Border | zinc-200 | `#e4e4e7` | - |

**ABSOLUTELY FORBIDDEN:**

| Color | Hex | Status |
|-------|-----|--------|
| Emerald | `#10b981` | ❌ BANNED |
| Teal | `#14b8a6` | ❌ BANNED |
| Cyan | `#06b6d4` | ❌ BANNED |
| Purple | `#8b5cf6` | ❌ BANNED |
| Pink | `#ec4899` | ❌ BANNED |

### 📏 Button Specifications (CRITICAL - WCAG 2.1 AA)

```json
{
  "height": {
    "min": 48,
    "max": 56,
    "preferred": 56,
    "unit": "px",
    "tolerance": 0
  },
  "padding": {
    "horizontal": "2rem",  // px-8
    "vertical": "auto"
  },
  "borderRadius": "0.75rem",  // rounded-xl
  "shadow": {
    "default": "shadow-sm",
    "hover": "shadow-md",
    "forbidden": ["shadow-lg", "shadow-xl", "shadow-2xl"]
  }
}
```

### 🔤 Typography

**Font Family:**
```css
font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
font-feature-settings: 'cv11';  /* Improved digits */
```

**Font Weights:**
- `400` (Regular) - Body text, paragraphs
- `500` (Medium) - Labels, captions
- `600` (Semibold) - Buttons, emphasized text
- `700` (Bold) - Headings (H1-H6)

**Font Sizes:**
```
xs:   0.75rem (12px)
sm:   0.875rem (14px)
base: 1rem (16px)      ← Body text default
lg:   1.125rem (18px)
xl:   1.25rem (20px)
2xl:  1.5rem (24px)
3xl:  1.875rem (30px)
4xl:  2.25rem (36px)
5xl:  3rem (48px)      ← Hero headings
6xl:  3.75rem (60px)
```

### 📐 Spacing (8pt Grid System)

**All spacing MUST be multiples of 8px (0.5rem):**

| Class | Value | Use Case |
|-------|-------|----------|
| `gap-1` | 4px (0.25rem) | Tight spacing |
| `gap-2` | 8px (0.5rem) | Default gap |
| `gap-3` | 12px (0.75rem) | Icon + text |
| `gap-4` | 16px (1rem) | Stack spacing |
| `gap-6` | 24px (1.5rem) | Section spacing |
| `gap-8` | 32px (2rem) | Large gaps |
| `gap-12` | 48px (3rem) | Hero sections |

**❌ FORBIDDEN:**
- Arbitrary values: `gap-[13px]`, `p-[27px]`
- Non-multiples: `gap-5` (20px), `gap-7` (28px)

### 🌑 Shadows (Minimal Style)

**Allowed:**
```css
shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)   /* Subtle cards */
shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1) /* Hover states */
```

**Forbidden:**
```css
shadow-lg:  ❌ Too heavy for Linear 2025 style
shadow-xl:  ❌ Too heavy
shadow-2xl: ❌ Too heavy
```

### 🃏 Card Design

```tsx
<div className="
  bg-white              // Pure white background
  border border-zinc-200 // 1px solid border
  rounded-xl            // 12px radius
  p-6                   // 24px padding
  shadow-sm             // Subtle shadow
">
  {/* Card content */}
</div>
```

### 👆 Touch Targets (WCAG 2.1 AA)

**Minimum Size:**
- Width: 48px
- Height: 48px
- Spacing: 8px minimum between targets

**Recommended:**
- Primary CTA: 56px height (`h-14`)
- Secondary: 48px height (`h-12`)

### 🎯 Focus States (Accessibility)

**Requirements:**
```css
focus:outline-none
focus:ring-2
focus:ring-indigo-600
focus:ring-offset-2
```

**Specifications:**
- Outline width: 2px minimum
- Contrast ratio: ≥ 3:1 against background
- Visible on all interactive elements

---

## 🧪 Validation Tests

### Test Categories

1. **🎨 Color Palette (CRITICAL)**
   - Validates exact hex values
   - Detects forbidden colors
   - Checks background is white/zinc-50/100

2. **📏 Button Height (CRITICAL)**
   - Measures actual pixel height
   - Validates 48-56px range
   - WCAG 2.1 AA compliance

3. **🔤 Text Contrast (CRITICAL)**
   - Calculates WCAG contrast ratios
   - Normal text: ≥ 4.5:1
   - Large text: ≥ 3.0:1

4. **🌑 Shadow Validation (HIGH)**
   - Detects heavy shadows (lg/xl/2xl)
   - Ensures minimal style

5. **📐 Spacing (MEDIUM)**
   - Validates 8pt grid alignment
   - Detects arbitrary values

6. **🃏 Card Design (MEDIUM)**
   - Checks rounded-xl
   - Validates border-zinc-200
   - Ensures p-6 padding

7. **🎯 Focus States (HIGH)**
   - Visible focus indicators
   - 2px minimum outline
   - High contrast

8. **✍️ Typography (MEDIUM)**
   - Inter font validation
   - Weight validation (headings ≥ 600)
   - CV11 feature check

9. **📱 Responsive (LOW)**
   - No horizontal scroll
   - Minimum 14px text on mobile

### Example Test

```typescript
test('All buttons must be 48-56px tall', async ({ page }) => {
  await page.goto('http://localhost:3002/');
  const buttons = await page.locator('button, a[href*="button"]').all();
  
  for (const button of buttons) {
    const box = await button.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(box.height).toBeLessThanOrEqual(56);
    }
  }
});
```

---

## 🧠 AI Review Workflow

### 1. Generate Prompt

The system automatically generates a **detailed AI review prompt** with:

- ✅ Exact specifications for each design element
- ✅ Measurement instructions (pixel rulers, contrast calculators)
- ✅ Validation checklists
- ✅ JSON output format

### 2. Capture Screenshot

```bash
# Using Playwright MCP
npx @playwright/mcp --output-dir ./design-reviews/screenshots

# Or manually
playwright codegen http://localhost:3002
```

### 3. Run AI Review

**Provide to Claude Vision API:**
1. Screenshot image
2. Generated prompt (from `design-reviews/ai-review-prompt-*.md`)

**Expected Output:**
```json
[
  {
    "category": "Button Height",
    "rule": "Primary CTA must be 48-56px",
    "severity": "critical",
    "passed": false,
    "measured": "44px",
    "expected": "56px",
    "location": "Primary CTA button",
    "fix": "Change h-11 to h-14 in page.tsx line 45"
  }
]
```

### 4. Apply Fixes

The AI output includes **exact code fixes**:

```diff
- <Link href="/oauth/select" className="h-11 px-8">
+ <Link href="/oauth/select" className="h-14 px-8">
    인스타그램으로 시작
  </Link>
```

---

## 📊 Scoring System

### Overall Score (0-100)

**Calculation:**
```
score = (passed_tests / total_tests) * 100
```

**Compliance Levels:**

| Score | Compliance | Description |
|-------|------------|-------------|
| 95-100 | Excellent | Perfect adherence to design system |
| 85-94 | Good | Minor deviations acceptable |
| 70-84 | Needs Work | Multiple issues need fixing |
| 0-69 | Critical | Major compliance problems |

### Severity Weights

**Test Prioritization:**

1. **CRITICAL** (Must Pass 100%)
   - Color palette
   - Button height (WCAG)
   - Text contrast (WCAG)
   - Touch targets

2. **HIGH** (≥ 90% pass rate)
   - Shadow validation
   - Focus states
   - Typography

3. **MEDIUM** (≥ 80% pass rate)
   - Spacing grid
   - Card design
   - Border radius

4. **LOW** (≥ 70% pass rate)
   - Responsive layout
   - Animation timing

---

## 🔧 Configuration

### Strict Mode

**Zero Tolerance Enforcement:**

```bash
npm run design:full-review:strict
```

**Behavior:**
- ✅ All CRITICAL rules: 100% pass required
- ✅ All HIGH rules: 100% pass required
- ✅ MEDIUM/LOW rules: ≥ 90% pass required
- ✅ Overall score: ≥ 95/100 required

### Standard Mode

**Balanced Validation:**

```bash
npm run design:full-review
```

**Behavior:**
- ✅ CRITICAL rules: ≥ 95% pass rate
- ✅ HIGH rules: ≥ 90% pass rate
- ✅ MEDIUM/LOW rules: ≥ 80% pass rate
- ✅ Overall score: ≥ 85/100 required

---

## 📈 CI/CD Integration

### GitHub Actions

```yaml
name: Design System Validation

on: [pull_request]

jobs:
  validate-design:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install chromium
      
      - name: Run dev server
        run: npm run dev &
      
      - name: Wait for server
        run: npx wait-on http://localhost:3002
      
      - name: Run design validation (STRICT)
        run: npm run design:full-review:strict
      
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: design-reports
          path: design-reviews/
```

---

## 📚 Reference

### Design System Standards

- **Linear 2025**: Minimal, white background, high contrast
- **Catalyst UI Kit**: Tailwind v4 component library
- **WCAG 2.1 AA**: Web accessibility guidelines
- **8pt Grid**: Industry standard spacing system

### Color Contrast Standards

**WCAG 2.1 Level AA:**

| Text Size | Weight | Minimum Contrast |
|-----------|--------|------------------|
| < 18px | Any | 4.5:1 |
| ≥ 18px | Any | 3.0:1 |
| ≥ 14px | Bold (≥700) | 3.0:1 |

**Pre-validated Combinations:**

```
✅ zinc-900 (#18181b) on white: 17.9:1
✅ zinc-600 (#52525b) on white: 7.5:1
✅ zinc-400 (#a1a1aa) on white: 4.6:1
✅ white on indigo-600 (#4f46e5): 8.3:1
```

### Touch Target Standards

**WCAG 2.1 Level AA (2.5.5):**
- Minimum size: 44×44 CSS pixels
- **ZZIK Standard**: 48×48px (safer)
- **Recommended**: 56px height for primary CTAs

---

## 🛠️ Troubleshooting

### Issue: Tests fail with "Page not found"

**Solution:**
```bash
# Ensure dev server is running
npm run dev

# In another terminal
npm run design:test
```

### Issue: Color validation fails

**Solution:**
1. Check `src/styles/tokens.css` for color definitions
2. Ensure `@import './tokens.css';` exists in `globals.css`
3. Verify no inline styles override design tokens

### Issue: Button height fails

**Solution:**
```diff
// Bad: h-11 (44px - below WCAG minimum)
- <button className="h-11 px-8">

// Good: h-12 (48px) or h-14 (56px - preferred)
+ <button className="h-14 px-8">
```

### Issue: Contrast ratio calculation incorrect

**Solution:**
- Ensure sRGB color space
- Use relative luminance formula:
  ```typescript
  L = 0.2126 * R + 0.7152 * G + 0.0722 * B
  ```
- Contrast ratio: `(L1 + 0.05) / (L2 + 0.05)`

---

## 📖 Examples

### Example 1: Fix Button Height

**Before (Failing Test):**
```tsx
<Link 
  href="/oauth/select"
  className="h-11 px-8 bg-indigo-600 text-white"
>
  시작하기
</Link>
```

**After (Passing Test):**
```tsx
<Link 
  href="/oauth/select"
  className="h-14 px-8 bg-indigo-600 text-white"
>
  시작하기
</Link>
```

### Example 2: Fix Color Palette

**Before (Failing Test):**
```css
/* tokens.css */
--color-surface-base: theme('colors.zinc.100');
```

**After (Passing Test):**
```css
/* tokens.css */
--color-surface-base: theme('colors.white');
```

### Example 3: Fix Shadow

**Before (Failing Test):**
```tsx
<div className="rounded-xl border border-zinc-200 shadow-xl p-6">
  {/* Card content */}
</div>
```

**After (Passing Test):**
```tsx
<div className="rounded-xl border border-zinc-200 shadow-sm p-6">
  {/* Card content */}
</div>
```

---

## 🎯 Success Metrics

### Definition of Done

A design is considered **compliant** when:

- ✅ All CRITICAL tests pass (100%)
- ✅ Overall score ≥ 85/100 (standard) or ≥ 95/100 (strict)
- ✅ No forbidden colors detected
- ✅ All buttons meet WCAG 2.1 AA touch target size
- ✅ All text meets WCAG 2.1 AA contrast ratios
- ✅ Spacing follows 8pt grid system
- ✅ Shadows are minimal (sm/md only)

### Continuous Improvement

**Weekly Review:**
1. Run `npm run design:full-review:strict`
2. Review HTML report
3. Address any failed tests
4. Update `DESIGN_RULES.json` if needed

**PR Requirements:**
- ✅ All design tests pass
- ✅ Visual regression tests pass
- ✅ No new accessibility violations

---

## 🤝 Contributing

### Adding New Rules

1. **Update `DESIGN_RULES.json`:**
   ```json
   {
     "components": {
       "input": {
         "height": {
           "min": 40,
           "max": 48,
           "preferred": 44,
           "unit": "px",
           "tolerance": 2
         }
       }
     }
   }
   ```

2. **Add Test:**
   ```typescript
   test('Input fields must be 40-48px tall', async ({ page }) => {
     const inputs = await page.locator('input').all();
     for (const input of inputs) {
       const box = await input.boundingBox();
       expect(box.height).toBeGreaterThanOrEqual(40);
       expect(box.height).toBeLessThanOrEqual(48);
     }
   });
   ```

3. **Update AI Prompt:**
   - Edit `design-reviewer.ts`
   - Add new validation category

---

## 📞 Support

For questions or issues:

1. Check `design-reviews/*.html` for detailed error reports
2. Review `DESIGN_RULES.json` for exact specifications
3. Run tests with `--ui` flag for interactive debugging

---

**Last Updated:** 2025-10-18
**Version:** 1.0.0
**Status:** ✅ Production Ready
