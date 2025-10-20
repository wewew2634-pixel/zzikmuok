#!/usr/bin/env tsx
/**
 * ZZIK Design System Reviewer
 * AI-powered, rule-based design validation system
 * 
 * Usage:
 *   npm run design:ai-review
 *   npm run design:ai-review -- --page=/matching --strict
 */

import fs from 'fs';
import path from 'path';

// Design Rules 로드
const rulesPath = path.join(__dirname, 'DESIGN_RULES.json');
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));

interface ValidationResult {
  category: string;
  rule: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  passed: boolean;
  message: string;
  details?: any;
  fix?: string;
  location?: {
    file: string;
    line?: number;
    column?: number;
  };
}

interface DesignReviewReport {
  timestamp: string;
  page: string;
  viewport: string;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  results: ValidationResult[];
  score: number; // 0-100
  passed: boolean;
}

/**
 * AI Prompt Generator for Design Review
 */
function generateDesignReviewPrompt(
  screenshotPath: string,
  pageName: string,
  viewport: string
): string {
  return `# ZZIK Design System Review - ${pageName} (${viewport})

## Your Task
You are an expert design system validator. Analyze this screenshot against the ZZIK Design System rules (Linear 2025 + Catalyst UI Kit).

## Screenshot
${screenshotPath}

## Design Rules to Validate

### 🎨 1. COLOR PALETTE (CRITICAL)
**Allowed Colors ONLY:**
- Background: Pure white (#ffffff), zinc-50 (#fafafa), zinc-100 (#f4f4f5)
- Text: zinc-900 (#18181b), zinc-600 (#52525b), zinc-400 (#a1a1aa)
- Accent: indigo-600 (#4f46e5), indigo-700 (#4338ca)
- Border: zinc-200 (#e4e4e7), zinc-100 (#f4f4f5)

**FORBIDDEN Colors:**
❌ Emerald, Teal, Cyan, Purple, Pink - 절대 사용 금지

**Check:**
- [ ] Background is pure white or zinc-50/100?
- [ ] Text uses only zinc-900/600/400?
- [ ] Accent uses only indigo-600/700?
- [ ] No forbidden colors (emerald, teal, cyan, purple, pink)?

---

### 📏 2. BUTTON HEIGHT (CRITICAL - WCAG 2.1 AA)
**Rules:**
- Minimum: 48px (WCAG requirement)
- Maximum: 56px
- Preferred: 56px (h-14 in Tailwind)
- Tolerance: 0px (exact match required)

**Check:**
- [ ] All primary buttons are 48-56px tall?
- [ ] All secondary buttons are 48-56px tall?
- [ ] No buttons below 48px (accessibility violation)?

**Measure in screenshot:** Use browser DevTools or estimate pixel height

---

### 🔤 3. TEXT CONTRAST (CRITICAL - WCAG 2.1 AA)
**Rules:**
- Normal text (< 18px): Minimum 4.5:1 contrast
- Large text (≥ 18px): Minimum 3.0:1 contrast

**Check:**
- [ ] Primary text (zinc-900 on white) has ≥ 4.5:1 contrast?
- [ ] Secondary text (zinc-600 on white) has ≥ 4.5:1 contrast?
- [ ] Tertiary text (zinc-400) only used for placeholders?

**Use WebAIM Contrast Checker logic:**
- zinc-900 (#18181b) on white (#ffffff): 17.9:1 ✅
- zinc-600 (#52525b) on white (#ffffff): 7.5:1 ✅
- zinc-400 (#a1a1aa) on white (#ffffff): 3.4:1 ⚠️ (large text only)

---

### 👆 4. TOUCH TARGETS (CRITICAL - WCAG 2.1 AA)
**Rules:**
- Minimum: 48×48px for all interactive elements
- Preferred: 56×56px

**Check:**
- [ ] All buttons meet 48×48px minimum?
- [ ] All links/icons meet 48×48px minimum?
- [ ] Proper spacing between touch targets (8px+)?

---

### 🌓 5. SHADOWS (HIGH)
**Allowed:**
- shadow-sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)" - 미묘함
- shadow-md: "0 4px 6px -1px rgb(0 0 0 / 0.1)" - 드롭다운

**FORBIDDEN:**
- ❌ shadow-lg, shadow-xl, shadow-2xl (too intense for Linear style)

**Check:**
- [ ] All shadows are subtle (barely visible)?
- [ ] No strong/heavy shadows?
- [ ] Shadow opacity ≤ 10%?

---

### 📐 6. SPACING (8PT GRID)
**Rules:**
- Use only: 0.5rem (4px), 1rem (8px), 1.5rem (12px), 2rem (16px), 3rem (24px)
- Forbidden: 0.3rem, 0.7rem, 0.9rem (not on 8pt grid)

**Check:**
- [ ] Section spacing is 8pt-aligned (py-16, py-24)?
- [ ] Card padding is 1.5rem or 2rem (p-6 or p-8)?
- [ ] Grid gaps are 1.5rem or 2rem (gap-6 or gap-8)?

---

### 🔤 7. TYPOGRAPHY (HIGH)
**Font:**
- Family: Inter (with CV11 OpenType feature)
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

**Check:**
- [ ] Font looks like Inter (rounded, modern)?
- [ ] Headings use semibold (600) or bold (700)?
- [ ] Body text uses normal (400)?

---

### 🎴 8. CARD DESIGN (MEDIUM)
**Rules:**
- Padding: 1.5rem (p-6) preferred
- Radius: 1rem (rounded-xl) always
- Border: 1px solid zinc-200
- Shadow: none or shadow-sm on hover
- Background: white or zinc-50

**Check:**
- [ ] Cards have rounded-xl corners?
- [ ] Cards have zinc-200 border?
- [ ] Cards don't have heavy shadows?

---

### 🎯 9. FOCUS STATES (HIGH - Accessibility)
**Rules:**
- All interactive elements must have visible focus state
- Style: 2px outline, indigo-600 color, 2px offset
- Variable: focus-visible:outline-2 focus-visible:outline-indigo-600

**Check:**
- [ ] Focus states are visible (test with Tab key)?
- [ ] Focus outline is indigo-600?

---

### 📱 10. RESPONSIVE DESIGN (MEDIUM)
**Check:**
- [ ] Layout adapts well to viewport (${viewport})?
- [ ] Text is readable (not too small)?
- [ ] Buttons are accessible (not too small)?
- [ ] No horizontal scroll?

---

## Output Format

Provide your analysis in this exact JSON format:

\`\`\`json
{
  "category": "Color Palette",
  "rule": "background-white-only",
  "severity": "critical",
  "passed": true,
  "message": "Background is pure white (#ffffff) ✅",
  "details": {
    "measured": "#ffffff",
    "expected": "#ffffff",
    "tolerance": 0
  },
  "fix": null,
  "location": {
    "file": "src/app/(marketing)/page.tsx",
    "element": "main"
  }
}
\`\`\`

**For EACH of the 10 categories above**, provide:
1. What you observed
2. Whether it passes or fails
3. Specific measurements (colors, sizes)
4. If failed: exact fix needed
5. Location in code (if identifiable)

## Severity Levels
- **critical**: Blocks production (WCAG violations, wrong colors)
- **high**: Should fix before PR merge
- **medium**: Should fix eventually
- **low**: Nice to have

## Be Extremely Precise
- Measure actual pixel heights/widths (don't estimate)
- Check exact hex colors (use color picker)
- Verify WCAG contrast ratios (calculate or use tools)
- Count spacing in multiples of 8px

## Example Critical Issues
❌ "Button height is 40px (should be 48-56px) - WCAG violation"
❌ "Found emerald-500 (#10b981) in accent button - forbidden color"
❌ "Text contrast is 3.8:1 (needs 4.5:1) - accessibility fail"

## Example Pass
✅ "Button height is 56px - meets WCAG 2.1 AA ✅"
✅ "Background is white (#ffffff), text is zinc-900 (#18181b) - correct palette ✅"

Now analyze the screenshot and provide complete validation results for ALL 10 categories.`;
}

/**
 * Generate AI Review Prompt (Concise Version for Claude)
 */
function generateConcisePrompt(screenshotPath: string): string {
  return `Analyze this screenshot against ZZIK Design System rules:

Screenshot: ${screenshotPath}

Check and report in JSON array format:

[
  {
    "category": "Color Palette",
    "rule": "white-zinc-indigo-only",
    "severity": "critical",
    "passed": boolean,
    "message": "detailed observation",
    "fix": "exact code fix if failed"
  },
  ...
]

Critical Rules:
1. Colors: ONLY white/zinc-50/100/200/400/600/900, indigo-600/700. NO emerald/teal/purple/pink
2. Button Height: 48-56px (WCAG). Measure exactly
3. Text Contrast: ≥4.5:1 for normal text (WCAG)
4. Touch Targets: ≥48×48px all interactive elements
5. Shadows: Only shadow-sm/md (subtle). No shadow-lg/xl/2xl
6. Spacing: 8pt grid (8px, 16px, 24px, 32px)
7. Font: Inter with semibold/bold headings
8. Cards: rounded-xl, border-zinc-200, p-6
9. Focus: Visible outline on all interactive
10. Responsive: Works well in current viewport

Be precise with measurements. Calculate contrast ratios. Identify forbidden colors by hex value.`;
}

/**
 * Calculate Color Contrast Ratio (WCAG)
 */
function calculateContrastRatio(fg: string, bg: string): number {
  // Simplified - in real implementation use proper color parsing
  const luminanceMap: Record<string, number> = {
    '#ffffff': 1.0,
    '#18181b': 0.056,
    '#52525b': 0.133,
    '#a1a1aa': 0.394,
    '#4f46e5': 0.155,
  };
  
  const L1 = luminanceMap[fg] || 0.5;
  const L2 = luminanceMap[bg] || 1.0;
  
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generate Code Fix Suggestions
 */
function generateFix(validation: ValidationResult): string | null {
  const fixes: Record<string, string> = {
    'button-height-below-48px': 
      'Change button height:\n- From: h-10 (40px)\n- To: h-14 (56px)\n- Class: "h-14 px-8"',
    
    'forbidden-color-emerald': 
      'Replace emerald with indigo:\n- From: bg-emerald-600\n- To: bg-indigo-600\n- Hex: #4f46e5',
    
    'text-contrast-too-low': 
      'Increase text contrast:\n- From: text-zinc-400 (3.4:1)\n- To: text-zinc-600 (7.5:1)\n- Use zinc-400 only for placeholders',
    
    'shadow-too-strong': 
      'Use subtle shadow:\n- From: shadow-lg\n- To: shadow-sm\n- Linear style requires subtle shadows',
    
    'spacing-not-8pt-grid': 
      'Align to 8pt grid:\n- From: py-5 (1.25rem / 20px)\n- To: py-6 (1.5rem / 24px)\n- Use: 4, 6, 8, 12, 16, 24',
  };
  
  return fixes[validation.rule] || null;
}

/**
 * Calculate Design System Score
 */
function calculateScore(results: ValidationResult[]): number {
  const weights = {
    critical: 10,
    high: 5,
    medium: 2,
    low: 1,
  };
  
  let totalWeight = 0;
  let earnedWeight = 0;
  
  for (const result of results) {
    const weight = weights[result.severity];
    totalWeight += weight;
    if (result.passed) {
      earnedWeight += weight;
    }
  }
  
  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
}

/**
 * Generate HTML Report
 */
function generateHTMLReport(report: DesignReviewReport): string {
  const critical = report.results.filter(r => r.severity === 'critical' && !r.passed);
  const high = report.results.filter(r => r.severity === 'high' && !r.passed);
  const medium = report.results.filter(r => r.severity === 'medium' && !r.passed);
  
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZZIK Design Review - ${report.page}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      background: #fafafa;
      color: #18181b;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: white;
      border: 1px solid #e4e4e7;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .score {
      font-size: 4rem;
      font-weight: 700;
      color: ${report.score >= 90 ? '#10b981' : report.score >= 70 ? '#f59e0b' : '#ef4444'};
    }
    .issue-card {
      background: white;
      border: 1px solid #e4e4e7;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .critical { border-left: 4px solid #ef4444; }
    .high { border-left: 4px solid #f59e0b; }
    .medium { border-left: 4px solid #3b82f6; }
    .fix-code {
      background: #f4f4f5;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-top: 1rem;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 ZZIK Design Review</h1>
      <p>Page: <strong>${report.page}</strong> | Viewport: <strong>${report.viewport}</strong></p>
      <p>Time: ${report.timestamp}</p>
      <div class="score">${report.score}/100</div>
      <p>${report.passed ? '✅ Passed' : '❌ Failed'}</p>
    </div>
    
    <h2>📊 Summary</h2>
    <p>Critical: ${report.criticalIssues} | High: ${report.highIssues} | Medium: ${report.mediumIssues}</p>
    
    ${critical.length > 0 ? `
    <h2>🔴 Critical Issues</h2>
    ${critical.map(issue => `
    <div class="issue-card critical">
      <h3>${issue.category}: ${issue.rule}</h3>
      <p>${issue.message}</p>
      ${issue.fix ? `<div class="fix-code">${issue.fix}</div>` : ''}
    </div>
    `).join('')}
    ` : ''}
    
    ${high.length > 0 ? `
    <h2>🟡 High Priority</h2>
    ${high.map(issue => `
    <div class="issue-card high">
      <h3>${issue.category}: ${issue.rule}</h3>
      <p>${issue.message}</p>
      ${issue.fix ? `<div class="fix-code">${issue.fix}</div>` : ''}
    </div>
    `).join('')}
    ` : ''}
    
    ${medium.length > 0 ? `
    <h2>🔵 Medium Priority</h2>
    ${medium.map(issue => `
    <div class="issue-card medium">
      <h3>${issue.category}: ${issue.rule}</h3>
      <p>${issue.message}</p>
    </div>
    `).join('')}
    ` : ''}
  </div>
</body>
</html>`;
}

/**
 * Main CLI
 */
async function main() {
  console.log('🎨 ZZIK Design System Reviewer\n');
  console.log('📋 Design Rules Loaded:');
  console.log(`   - Color Palette: ${Object.keys(rules.colorPalette.primary).length} rules`);
  console.log(`   - Components: ${Object.keys(rules.components).length} types`);
  console.log(`   - Accessibility: WCAG ${rules.accessibility.wcag.level} ${rules.accessibility.wcag.version}`);
  console.log(`   - Critical Rules: ${rules.validation.critical.length}\n`);
  
  console.log('💡 Usage:');
  console.log('   1. Take screenshot: npm run design:update');
  console.log('   2. Run AI review: npm run design:ai-review');
  console.log('   3. Or use Claude: "Review design based on DESIGN_RULES.json"\n');
  
  console.log('📝 Prompt Template Generated');
  console.log('   File: design-system/design-review-prompt.txt\n');
  
  // Save prompt template
  const promptPath = path.join(__dirname, 'design-review-prompt.txt');
  const prompt = generateDesignReviewPrompt(
    './design-reviews/screenshots/landing-desktop.png',
    'Landing Page',
    '1920x1080'
  );
  
  fs.writeFileSync(promptPath, prompt, 'utf-8');
  console.log('✅ Prompt saved! Copy it to Claude for AI review.');
}

if (require.main === module) {
  main();
}

export {
  generateDesignReviewPrompt,
  generateConcisePrompt,
  calculateContrastRatio,
  calculateScore,
  generateHTMLReport,
};
export type { ValidationResult, DesignReviewReport };
