# ZZMUK Design Loop Integration

**TL;DR**: Complete visual regression testing with Playwright + Axe + Percy. Run `npm run test:design-loop` to execute full quality gates.

---

## 📊 What is Design Loop?

Design Loop is Agent-Optimize's quality assurance system that enforces:

1. **E2E Tests** (Playwright): User flow validation
2. **Accessibility** (Axe): WCAG 2.1 AA >95% compliance
3. **Visual Regression** (Percy): <5% pixel diff threshold
4. **Performance** (API): p95 <200ms response time

---

## 🚀 Quick Start

### Install Dependencies

```bash
cd zzik
npm install
```

This installs:
- `@playwright/test` - E2E testing
- `@axe-core/playwright` - Accessibility scanner
- `@percy/playwright` + `@percy/cli` - Visual regression

### Run Tests

```bash
# Local E2E only (no Percy)
npm run test:e2e

# With Percy visual regression
export PERCY_TOKEN=your_percy_token
npm run test:visual

# Full Design Loop with report
npm run test:design-loop
```

### View Reports

```bash
# Open Playwright HTML report
npm run report:show

# Generate Design Loop HTML report
npm run report:html
# Then open .reports/design-loop-report.html
```

---

## 📁 File Structure

```
zzik/
├── percy.yml                          # Percy configuration (5% threshold)
├── config/
│   └── thresholds.yml                 # Quality gate thresholds
├── tests/e2e/
│   ├── 01-homepage.spec.ts            # Homepage tests + Percy snapshots
│   └── 02-matching-flow.spec.ts       # Matching flow + Percy snapshots
├── scripts/
│   ├── triggers/
│   │   └── design-loop-percy.mjs      # Orchestrator script
│   ├── report-html.mjs                # HTML report generator
│   └── load-test-matching.js          # Performance load test
└── playwright.config.ts               # Playwright configuration
```

---

## 🎨 Percy Snapshots

Percy captures visual snapshots at key interaction points:

### Homepage
- **Initial Load**: Full page render
- **After CTA Click**: Navigation after user interaction

### Matching Flow
- **Dashboard**: Matching page initial state
- **Match Results**: Results display after API call

Each snapshot is captured at **3 viewport sizes**:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px

---

## 🔧 Configuration

### Percy (percy.yml)

```yaml
version: 2
comparison:
  threshold: 0.05  # 5% visual difference allowed
browser:
  name: chromium
```

### Thresholds (config/thresholds.yml)

```yaml
visual:
  threshold: 5.0  # %

accessibility:
  wcag_level: AA
  min_score: 95.0  # %

performance:
  api_p95: 200  # ms
```

---

## 🤖 CI/CD Integration

Design Loop runs automatically on every PR via GitHub Actions:

**.github/workflows/ci.yml** → `design-loop` job

```yaml
- name: Run Playwright + Percy tests
  run: npx percy exec -- npx playwright test
  env:
    PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

**Required Secret**: Add `PERCY_TOKEN` to GitHub repository secrets.

---

## 📋 NPM Scripts

| Script | Description |
|--------|-------------|
| `test:e2e` | Run Playwright E2E tests (local screenshots only) |
| `test:e2e:ui` | Run with Playwright UI mode (interactive) |
| `test:visual` | Run with Percy visual regression |
| `test:design-loop` | Full Design Loop orchestration |
| `report:html` | Generate HTML report |
| `report:show` | Open Playwright HTML report |
| `load:test` | Run API performance load test |

---

## 🎯 Quality Gates

Tests **FAIL** if:
- ❌ Any Playwright test fails
- ❌ Critical/serious accessibility violations found
- ❌ Visual regression >5% difference
- ❌ API p95 >200ms

Tests **PASS** if:
- ✅ All E2E tests pass
- ✅ Accessibility >95% (WCAG AA)
- ✅ Visual diff <5%
- ✅ Performance within targets

---

## 🔗 Percy Dashboard

1. Sign up at https://percy.io
2. Create a project: **ZZMUK**
3. Get API token: Settings → Integrations → Percy Token
4. Export token: `export PERCY_TOKEN=your_token`
5. Run tests: `npm run test:visual`
6. View builds: https://percy.io/your-org/ZZMUK

---

## 💡 Usage Examples

### Local Development

```bash
# Run E2E tests while developing
npm run test:e2e

# Update baseline screenshots
npm run test:e2e -- --update-snapshots

# Debug specific test
npx playwright test tests/e2e/01-homepage.spec.ts --debug
```

### CI Environment

```bash
# Full pipeline (in GitHub Actions)
PERCY_TOKEN=${{ secrets.PERCY_TOKEN }} \
  npx percy exec -- npx playwright test
```

### Reviewing Changes

```bash
# 1. Run tests
npm run test:design-loop

# 2. View Playwright report
npm run report:show

# 3. Generate HTML summary
npm run report:html

# 4. Check Percy dashboard for visual diffs
# https://percy.io/your-org/ZZMUK
```

---

## 🐛 Troubleshooting

### Percy Token Not Working

```bash
# Check if token is set
echo $PERCY_TOKEN

# Set token
export PERCY_TOKEN=your_actual_token

# Verify Percy CLI
npx percy --version
```

### Playwright Browsers Not Installed

```bash
# Install Chromium (used by Percy)
npx playwright install chromium

# Install all browsers
npx playwright install
```

### Tests Failing Locally

```bash
# Clear test results
rm -rf test-results playwright-report

# Update baseline snapshots
npm run test:e2e -- --update-snapshots

# Re-run tests
npm run test:e2e
```

### Percy Builds Not Appearing

1. Check Percy token is correct
2. Verify project name matches Percy dashboard
3. Check network connectivity
4. Review Percy CLI output for errors

---

## 📊 Example Report Output

```
📊 Design Loop Results:
  E2E Tests:
    ✅ Passed: 6
    ❌ Failed: 0
    ⏭️  Skipped: 0

  Accessibility:
    Target: WCAG 2.1 AA, >95% compliance
    ✅ No critical/serious violations

  Visual Regression (Percy):
    Threshold: 5% visual difference
    🔗 Percy Dashboard: https://percy.io/wewew2634/ZZMUK

📁 Reports:
  Playwright HTML: playwright-report/index.html
  Screenshots: test-results/
  Design Loop: .reports/design-loop-report.html
```

---

## 🎓 Best Practices

1. **Always run locally before pushing**
   ```bash
   npm run test:e2e
   ```

2. **Review Percy diffs carefully**
   - Approve intentional changes
   - Reject unintended visual bugs

3. **Keep snapshots up-to-date**
   - Update after UI changes
   - Document why baselines changed

4. **Monitor performance**
   ```bash
   npm run load:test
   ```

5. **Check accessibility regularly**
   - Fix violations immediately
   - Don't accumulate technical debt

---

## 🔄 Integration with Orchestration

Design Loop is **Agent-Optimize** in the ZZMUK orchestration:

```
Agent-Tech      → Matching API (p95 <200ms)
Agent-Revenue   → Stripe webhooks (approval pending)
Agent-Biz       → Analytics + A/B testing
Agent-Optimize  → Design Loop ← YOU ARE HERE
```

**Orchestration Rules Applied**:
- TL;DR → Evidence → Checklist format
- Units: %, ms, pixels
- 90m timebox per agent
- Stop-rule: 0% improvement = pivot

---

## 📞 Support

**Questions?**
- Check Playwright docs: https://playwright.dev
- Check Percy docs: https://docs.percy.io
- Check Axe docs: https://github.com/dequelabs/axe-core

**Issues?**
- Review CI logs: `.github/workflows/ci.yml`
- Check test reports: `playwright-report/index.html`
- Enable debug mode: `DEBUG=pw:api npx playwright test`

---

## ✅ Checklist

Before pushing changes:

- [ ] Run `npm run test:e2e` locally
- [ ] All tests pass
- [ ] Accessibility compliance >95%
- [ ] Visual snapshots reviewed
- [ ] Percy diffs approved (if using Percy)
- [ ] Performance targets met
- [ ] CI pipeline green

---

**Generated by**: Agent-Optimize (Design Loop Integration)
**Format**: TL;DR → Evidence → Checklist
**Status**: ✅ Complete
