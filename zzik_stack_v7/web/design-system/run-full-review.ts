#!/usr/bin/env tsx
/**
 * ZZIK Design System - Complete Review Workflow
 * 
 * This script orchestrates the complete design validation process:
 * 1. Runs Playwright automated tests with exact measurements
 * 2. Generates AI review prompts for manual inspection
 * 3. Combines results into unified HTML report
 * 4. Calculates overall design system compliance score
 * 
 * Usage:
 *   npm run design:full-review
 *   npm run design:full-review -- --page=/matching --strict
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ReviewConfig {
  page?: string;
  viewport?: string;
  strict?: boolean;
  generateFixes?: boolean;
}

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errors?: string[];
}

interface FullReviewReport {
  timestamp: string;
  page: string;
  viewport: string;
  automated: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    tests: TestResult[];
  };
  aiReview: {
    promptGenerated: boolean;
    promptPath?: string;
    screenshotPath?: string;
  };
  overallScore: number;
  compliance: 'excellent' | 'good' | 'needs-work' | 'critical';
  recommendations: string[];
}

/**
 * Run Playwright automated tests
 */
async function runAutomatedTests(config: ReviewConfig): Promise<TestResult[]> {
  console.log('🤖 Running automated design system tests...\n');
  
  try {
    const testCommand = config.strict
      ? 'npx playwright test tests/visual/design-system-validation.spec.ts --reporter=json'
      : 'npx playwright test tests/visual/design-system-validation.spec.ts --reporter=json --retries=1';
    
    const output = execSync(testCommand, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // Parse JSON output
    const results = JSON.parse(output);
    const tests: TestResult[] = results.suites.flatMap((suite: any) => 
      suite.tests.map((test: any) => ({
        name: test.title,
        status: test.status,
        duration: test.duration,
        errors: test.errors?.map((e: any) => e.message)
      }))
    );
    
    return tests;
  } catch (error: any) {
    console.error('❌ Automated tests failed:', error.message);
    
    // Even if tests fail, try to parse partial results
    if (error.stdout) {
      try {
        const results = JSON.parse(error.stdout);
        return results.suites.flatMap((suite: any) => 
          suite.tests.map((test: any) => ({
            name: test.title,
            status: test.status,
            duration: test.duration,
            errors: test.errors?.map((e: any) => e.message)
          }))
        );
      } catch {
        return [];
      }
    }
    
    return [];
  }
}

/**
 * Generate AI review prompt
 */
async function generateAIPrompt(config: ReviewConfig): Promise<{ 
  promptPath: string; 
  screenshotPath?: string 
}> {
  console.log('🧠 Generating AI review prompt...\n');
  
  const promptContent = `# ZZIK Design System - AI Review Request

## Page: ${config.page || 'Landing Page (/)'}
## Viewport: ${config.viewport || 'Desktop (1920x1080)'}
## Review Mode: ${config.strict ? 'STRICT (Zero Tolerance)' : 'STANDARD'}

---

## 📸 Screenshot Analysis Required

Please analyze the provided screenshot against these **exact specifications**:

### 🎨 1. COLOR PALETTE (CRITICAL - Zero Tolerance)

**Allowed Colors ONLY:**
- Background Base: \`#ffffff\` (pure white)
- Background Raised: \`#fafafa\` (zinc-50)
- Background Elevated: \`#f4f4f5\` (zinc-100)
- Text Primary: \`#18181b\` (zinc-900) - Contrast: 17.9:1 ✅
- Text Secondary: \`#52525b\` (zinc-600) - Contrast: 7.5:1 ✅
- Text Tertiary: \`#a1a1aa\` (zinc-400) - Contrast: 4.6:1 ✅
- Accent Primary: \`#4f46e5\` (indigo-600)
- Accent Hover: \`#4338ca\` (indigo-700)
- Border: \`#e4e4e7\` (zinc-200)

**ABSOLUTELY FORBIDDEN:**
❌ Emerald: \`#10b981\`
❌ Teal: \`#14b8a6\`
❌ Cyan: \`#06b6d4\`
❌ Purple: \`#8b5cf6\`
❌ Pink: \`#ec4899\`

**Validation:**
- [ ] Is background pure white (\`#ffffff\`) or zinc-50/100?
- [ ] Are there ANY forbidden colors present?
- [ ] Do all text colors match exact hex values?

---

### 📏 2. BUTTON HEIGHT (CRITICAL - WCAG 2.1 AA)

**Exact Requirements:**
- **Minimum Height:** 48px (absolute minimum per WCAG)
- **Maximum Height:** 56px
- **Preferred Height:** 56px
- **Tolerance:** 0px (no variance allowed in ${config.strict ? 'STRICT' : 'STANDARD'} mode)

**Measurement Instructions:**
1. Use pixel ruler tool
2. Measure from top border to bottom border
3. Include padding in measurement
4. Report exact pixel value

**Validation:**
- [ ] Primary CTA button height = ___px (48-56px required)
- [ ] Secondary button height = ___px (48-56px required)
- [ ] All interactive buttons meet minimum?

---

### 🔤 3. TEXT CONTRAST (CRITICAL - WCAG 2.1 AA)

**Required Ratios:**
- Normal Text (< 18px): **≥ 4.5:1**
- Large Text (≥ 18px or ≥ 14px bold): **≥ 3.0:1**

**Pre-calculated Valid Combinations:**
- zinc-900 (\`#18181b\`) on white: **17.9:1** ✅
- zinc-600 (\`#52525b\`) on white: **7.5:1** ✅
- zinc-400 (\`#a1a1aa\`) on white: **4.6:1** ✅
- white on indigo-600 (\`#4f46e5\`): **8.3:1** ✅

**Validation:**
- [ ] H1 heading contrast = ___:1 (≥4.5 required)
- [ ] Body text contrast = ___:1 (≥4.5 required)
- [ ] Button text on colored bg = ___:1 (≥4.5 required)

---

### 👆 4. TOUCH TARGETS (CRITICAL - Mobile)

**WCAG 2.1 AA Level Requirements:**
- Minimum: 48px × 48px
- Spacing: 8px minimum between targets
- No overlapping targets

**Validation:**
- [ ] All buttons meet 48×48px minimum?
- [ ] Adequate spacing between clickable elements?

---

### 🌑 5. SHADOWS (HIGH Priority)

**Allowed Shadows:**
- ✅ \`shadow-sm\`: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- ✅ \`shadow-md\`: 0 4px 6px -1px rgb(0 0 0 / 0.1)

**Forbidden Shadows:**
- ❌ \`shadow-lg\`: Too heavy for Linear 2025 style
- ❌ \`shadow-xl\`: Too heavy
- ❌ \`shadow-2xl\`: Too heavy

**Validation:**
- [ ] Are shadows subtle (sm/md only)?
- [ ] No heavy drop shadows present?

---

### 📐 6. SPACING (8pt Grid System)

**Allowed Values (multiples of 8px/0.5rem):**
- 4px (0.25rem) - gap-1
- 8px (0.5rem) - gap-2, p-2, m-2
- 12px (0.75rem) - gap-3, p-3, m-3
- 16px (1rem) - gap-4, p-4, m-4
- 24px (1.5rem) - gap-6, p-6, m-6
- 32px (2rem) - gap-8, p-8, m-8
- 48px (3rem) - gap-12, p-12, m-12

**Validation:**
- [ ] All spacing follows 8pt grid?
- [ ] No arbitrary values (e.g., 13px, 27px)?

---

### ✍️ 7. TYPOGRAPHY

**Font Family:**
- Primary: **Inter** (with CV11 feature)
- Fallback: ui-sans-serif, system-ui, sans-serif

**Font Weights:**
- Regular: 400 (body text)
- Medium: 500 (labels, captions)
- Semibold: 600 (buttons, emphasized text)
- Bold: 700 (headings)

**Font Sizes:**
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)
- 5xl: 3rem (48px)
- 6xl: 3.75rem (60px)

**Validation:**
- [ ] Font is Inter with CV11?
- [ ] Headings use weight ≥ 600?
- [ ] Body text uses weight 400?

---

### 🃏 8. CARD DESIGN

**Specifications:**
- Border Radius: \`rounded-xl\` (0.75rem / 12px)
- Border: \`border-zinc-200\` (1px solid)
- Background: \`bg-white\` or \`bg-zinc-50\`
- Padding: \`p-6\` (1.5rem / 24px)
- Shadow: \`shadow-sm\` (subtle)

**Forbidden:**
- ❌ \`rounded-3xl\` (too rounded)
- ❌ Heavy borders (> 1px)
- ❌ Heavy shadows (lg/xl/2xl)

**Validation:**
- [ ] Cards use rounded-xl?
- [ ] Borders are 1px zinc-200?
- [ ] Padding is consistent (p-6)?

---

### 🎯 9. FOCUS STATES (Accessibility)

**Requirements:**
- Visible focus indicator required
- Minimum 2px outline
- High contrast (≥ 3:1 against background)
- Color: indigo-600 or zinc-900

**Validation:**
- [ ] All interactive elements have visible focus?
- [ ] Focus outline is ≥ 2px?
- [ ] Focus indicator is high contrast?

---

### 📱 10. RESPONSIVE DESIGN

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: ≥ 1024px

**Requirements:**
- No horizontal scroll at any breakpoint
- Touch targets scale appropriately
- Text remains readable (≥ 14px on mobile)

**Validation:**
- [ ] Content fits viewport at ${config.viewport}?
- [ ] No overflow or horizontal scroll?
- [ ] Text size appropriate for viewport?

---

## 📊 Output Format

Please provide a JSON array with the following structure:

\`\`\`json
[
  {
    "category": "Color Palette",
    "rule": "Background must be white",
    "severity": "critical",
    "passed": false,
    "measured": "#f4f4f5",
    "expected": "#ffffff",
    "location": "Body element",
    "fix": "Change bg-zinc-100 to bg-white in globals.css line 12"
  },
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
\`\`\`

## 🎯 Success Criteria

${config.strict ? `
**STRICT MODE - Zero Tolerance:**
- All CRITICAL rules must pass (100%)
- All HIGH priority rules must pass (100%)
- MEDIUM/LOW rules: ≥ 90% pass rate
- Overall score: ≥ 95/100
` : `
**STANDARD MODE:**
- CRITICAL rules: ≥ 95% pass rate
- HIGH priority rules: ≥ 90% pass rate
- MEDIUM/LOW rules: ≥ 80% pass rate
- Overall score: ≥ 85/100
`}

---

## 🔧 Additional Context

**Project:** ZZIK - Local Short-form Matching Platform
**Design System:** Linear 2025 + Catalyst UI Kit
**Style Guide:** Minimal, high contrast, white background
**Target:** Instagram Reels + Tinder hybrid interface
**Accessibility:** WCAG 2.1 AA compliant

---

**Thank you for your thorough review!** 🙏
`;

  // Create review directory
  const reviewDir = path.join(__dirname, '..', 'design-reviews');
  if (!fs.existsSync(reviewDir)) {
    fs.mkdirSync(reviewDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const promptPath = path.join(reviewDir, `ai-review-prompt-${timestamp}.md`);
  
  fs.writeFileSync(promptPath, promptContent, 'utf-8');
  
  console.log(`✅ AI review prompt generated: ${promptPath}\n`);
  
  return { promptPath };
}

/**
 * Calculate overall compliance score
 */
function calculateOverallScore(tests: TestResult[]): {
  score: number;
  compliance: 'excellent' | 'good' | 'needs-work' | 'critical';
} {
  if (tests.length === 0) {
    return { score: 0, compliance: 'critical' };
  }

  const passed = tests.filter(t => t.status === 'passed').length;
  const score = Math.round((passed / tests.length) * 100);

  let compliance: 'excellent' | 'good' | 'needs-work' | 'critical';
  if (score >= 95) compliance = 'excellent';
  else if (score >= 85) compliance = 'good';
  else if (score >= 70) compliance = 'needs-work';
  else compliance = 'critical';

  return { score, compliance };
}

/**
 * Generate recommendations
 */
function generateRecommendations(tests: TestResult[], config: ReviewConfig): string[] {
  const recommendations: string[] = [];
  const failedTests = tests.filter(t => t.status === 'failed');

  // Color palette issues
  const colorTests = failedTests.filter(t => t.name.includes('color') || t.name.includes('palette'));
  if (colorTests.length > 0) {
    recommendations.push(
      '🎨 **Color Palette Issues Detected**: Review tokens.css and ensure only allowed zinc/indigo colors are used. Remove any teal, purple, or cyan variants.'
    );
  }

  // Button height issues
  const buttonTests = failedTests.filter(t => t.name.includes('button') && t.name.includes('height'));
  if (buttonTests.length > 0) {
    recommendations.push(
      '📏 **Button Height Non-compliance**: Update all buttons to use h-12 (48px) or h-14 (56px) classes. This is critical for WCAG 2.1 AA compliance.'
    );
  }

  // Contrast issues
  const contrastTests = failedTests.filter(t => t.name.includes('contrast'));
  if (contrastTests.length > 0) {
    recommendations.push(
      '🔤 **Text Contrast Issues**: Ensure text uses zinc-900 (primary), zinc-600 (secondary), or zinc-400 (tertiary) on white backgrounds. All combinations are pre-validated for WCAG AA.'
    );
  }

  // Shadow issues
  const shadowTests = failedTests.filter(t => t.name.includes('shadow'));
  if (shadowTests.length > 0) {
    recommendations.push(
      '🌑 **Shadow Violations**: Replace shadow-lg, shadow-xl, or shadow-2xl with shadow-sm or shadow-md. Linear 2025 style uses minimal shadows.'
    );
  }

  // Spacing issues
  const spacingTests = failedTests.filter(t => t.name.includes('spacing') || t.name.includes('grid'));
  if (spacingTests.length > 0) {
    recommendations.push(
      '📐 **Spacing Grid Violations**: All spacing must follow 8pt grid (multiples of 0.5rem). Remove arbitrary values like gap-[13px].'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ **Excellent compliance!** All automated tests passed. Continue manual AI review for visual polish.');
  }

  return recommendations;
}

/**
 * Generate unified HTML report
 */
function generateHTMLReport(report: FullReviewReport): string {
  const { automated, overallScore, compliance } = report;
  const failedTests = automated.tests.filter(t => t.status === 'failed');
  
  const complianceColor = {
    'excellent': '#10b981',
    'good': '#3b82f6',
    'needs-work': '#f59e0b',
    'critical': '#ef4444'
  }[compliance];

  const complianceLabel = {
    'excellent': 'Excellent',
    'good': 'Good',
    'needs-work': 'Needs Work',
    'critical': 'Critical Issues'
  }[compliance];

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZZIK Design System Review - ${report.page}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      background: #ffffff;
      color: #18181b;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }
    
    .header {
      text-align: center;
      margin-bottom: 4rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e4e4e7;
    }
    
    .score-display {
      font-size: 6rem;
      font-weight: 700;
      color: ${complianceColor};
      line-height: 1;
      margin: 2rem 0 1rem;
    }
    
    .compliance-badge {
      display: inline-block;
      padding: 0.5rem 1.5rem;
      background: ${complianceColor};
      color: white;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 1.125rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin: 3rem 0;
    }
    
    .stat-card {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 0.75rem;
      padding: 1.5rem;
      text-align: center;
    }
    
    .stat-value {
      font-size: 3rem;
      font-weight: 700;
      color: #18181b;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #52525b;
      font-weight: 500;
      margin-top: 0.5rem;
    }
    
    .section {
      margin: 3rem 0;
    }
    
    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #18181b;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #4f46e5;
    }
    
    .test-list {
      list-style: none;
    }
    
    .test-item {
      background: #fafafa;
      border-left: 4px solid #e4e4e7;
      padding: 1rem 1.5rem;
      margin-bottom: 0.75rem;
      border-radius: 0.5rem;
    }
    
    .test-item.failed {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    
    .test-item.passed {
      border-left-color: #10b981;
    }
    
    .test-name {
      font-weight: 600;
      color: #18181b;
      margin-bottom: 0.25rem;
    }
    
    .test-error {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      color: #dc2626;
      background: white;
      padding: 0.75rem;
      border-radius: 0.375rem;
      margin-top: 0.5rem;
      overflow-x: auto;
    }
    
    .recommendations {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 0.75rem;
      padding: 1.5rem;
    }
    
    .recommendation-item {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
      position: relative;
    }
    
    .recommendation-item::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #4f46e5;
      font-weight: 700;
    }
    
    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 3rem;
      padding: 1.5rem;
      background: #fafafa;
      border-radius: 0.75rem;
    }
    
    .metadata-item {
      font-size: 0.875rem;
    }
    
    .metadata-label {
      font-weight: 600;
      color: #52525b;
    }
    
    .metadata-value {
      color: #18181b;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>ZZIK Design System Review</h1>
      <div class="score-display">${overallScore}<span style="font-size: 3rem; color: #a1a1aa;">/100</span></div>
      <div class="compliance-badge">${complianceLabel}</div>
    </header>

    <section class="stats-grid">
      <div class="stat-card">
        <div class="stat-value" style="color: #10b981;">${automated.passed}</div>
        <div class="stat-label">Tests Passed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #ef4444;">${automated.failed}</div>
        <div class="stat-label">Tests Failed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${automated.totalTests}</div>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${overallScore}%</div>
        <div class="stat-label">Compliance Rate</div>
      </div>
    </section>

    ${failedTests.length > 0 ? `
    <section class="section">
      <h2 class="section-title">❌ Failed Tests (${failedTests.length})</h2>
      <ul class="test-list">
        ${failedTests.map(test => `
        <li class="test-item failed">
          <div class="test-name">${test.name}</div>
          ${test.errors?.map(err => `
            <div class="test-error">${err}</div>
          `).join('') || ''}
        </li>
        `).join('')}
      </ul>
    </section>
    ` : ''}

    <section class="section">
      <h2 class="section-title">💡 Recommendations</h2>
      <div class="recommendations">
        ${report.recommendations.map(rec => `
          <div class="recommendation-item">${rec}</div>
        `).join('')}
      </div>
    </section>

    ${report.aiReview.promptGenerated ? `
    <section class="section">
      <h2 class="section-title">🧠 AI Review</h2>
      <p style="color: #52525b; margin-bottom: 1rem;">
        An AI review prompt has been generated for manual inspection. 
        Please review the screenshot and provide detailed feedback using the prompt.
      </p>
      <p style="font-family: monospace; background: #fafafa; padding: 1rem; border-radius: 0.5rem;">
        ${report.aiReview.promptPath}
      </p>
    </section>
    ` : ''}

    <section class="metadata">
      <div class="metadata-item">
        <div class="metadata-label">Timestamp</div>
        <div class="metadata-value">${report.timestamp}</div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Page</div>
        <div class="metadata-value">${report.page}</div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Viewport</div>
        <div class="metadata-value">${report.viewport}</div>
      </div>
    </section>
  </div>
</body>
</html>`;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const config: ReviewConfig = {
    page: args.find(a => a.startsWith('--page='))?.split('=')[1] || '/',
    viewport: args.find(a => a.startsWith('--viewport='))?.split('=')[1] || 'Desktop (1920x1080)',
    strict: args.includes('--strict'),
    generateFixes: args.includes('--fixes')
  };

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  ZZIK Design System - Complete Review Workflow          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`📄 Page: ${config.page}`);
  console.log(`📐 Viewport: ${config.viewport}`);
  console.log(`🎯 Mode: ${config.strict ? 'STRICT (Zero Tolerance)' : 'STANDARD'}`);
  console.log('');

  // Step 1: Run automated tests
  const testResults = await runAutomatedTests(config);
  
  // Step 2: Generate AI prompt
  const aiReview = await generateAIPrompt(config);
  
  // Step 3: Calculate scores
  const { score, compliance } = calculateOverallScore(testResults);
  
  // Step 4: Generate recommendations
  const recommendations = generateRecommendations(testResults, config);

  // Step 5: Create unified report
  const report: FullReviewReport = {
    timestamp: new Date().toISOString(),
    page: config.page || '/',
    viewport: config.viewport || 'Desktop (1920x1080)',
    automated: {
      totalTests: testResults.length,
      passed: testResults.filter(t => t.status === 'passed').length,
      failed: testResults.filter(t => t.status === 'failed').length,
      skipped: testResults.filter(t => t.status === 'skipped').length,
      tests: testResults
    },
    aiReview: {
      promptGenerated: true,
      promptPath: aiReview.promptPath,
      screenshotPath: aiReview.screenshotPath
    },
    overallScore: score,
    compliance,
    recommendations
  };

  // Generate HTML report
  const htmlReport = generateHTMLReport(report);
  const reviewDir = path.join(__dirname, '..', 'design-reviews');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const htmlPath = path.join(reviewDir, `full-review-${timestamp}.html`);
  fs.writeFileSync(htmlPath, htmlReport, 'utf-8');

  // Save JSON report
  const jsonPath = path.join(reviewDir, `full-review-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Review Complete!                                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Overall Score: ${score}/100 (${compliance.toUpperCase()})`);
  console.log(`✅ Passed: ${report.automated.passed}/${report.automated.totalTests}`);
  console.log(`❌ Failed: ${report.automated.failed}/${report.automated.totalTests}`);
  console.log('');
  console.log(`📄 HTML Report: ${htmlPath}`);
  console.log(`📋 JSON Report: ${jsonPath}`);
  console.log(`🧠 AI Prompt: ${aiReview.promptPath}`);
  console.log('');

  if (report.automated.failed > 0) {
    console.log('⚠️  Failed Tests:');
    report.automated.tests
      .filter(t => t.status === 'failed')
      .forEach((test, i) => {
        console.log(`  ${i + 1}. ${test.name}`);
      });
    console.log('');
  }

  console.log('💡 Next Steps:');
  recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec.replace(/\*\*/g, '')}`);
  });
  console.log('');

  process.exit(report.automated.failed > 0 ? 1 : 0);
}

main().catch(console.error);
