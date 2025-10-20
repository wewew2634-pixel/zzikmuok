import { NextRequest, NextResponse } from "next/server";
import { chromium } from 'playwright';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600; // 10 minutes for batch processing

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PageRoute {
  path: string;
  name: string;
  group?: string;
}

interface PageAnalysis {
  path: string;
  name: string;
  screenshot: string;
  score: number;
  passed: boolean;
  issues: Array<{
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
  }>;
  viewport: { width: number; height: number };
}

interface BatchReviewResponse {
  success: boolean;
  totalPages: number;
  averageScore: number;
  passRate: number;
  pages: PageAnalysis[];
  summary: {
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  timestamp: string;
  reportPath?: string;
  error?: string;
}

/**
 * POST /api/design-review/batch
 * 
 * 🔥 전체 페이지 통괄 디자인 검증
 * 
 * Features:
 * - Auto-discover all pages in Next.js app
 * - Batch screenshot capture (parallel)
 * - GPT-4o Vision analysis for each page
 * - Comprehensive HTML report
 * - Overall pass/fail judgment
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/design-review/batch', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     baseUrl: 'http://localhost:3001',
 *     viewport: { width: 1920, height: 1080 },
 *     strict: true
 *   })
 * });
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      baseUrl = 'http://localhost:3001',
      viewport = { width: 1920, height: 1080 },
      strict = false,
      pages: customPages
    } = await request.json();

    console.log('🚀 Starting batch design review...');
    console.log(`📍 Base URL: ${baseUrl}`);
    console.log(`📱 Viewport: ${viewport.width}×${viewport.height}`);
    console.log(`🎯 Mode: ${strict ? 'STRICT (95/100)' : 'STANDARD (85/100)'}\n`);

    // Step 1: Auto-discover pages or use custom list
    const pagesToReview: PageRoute[] = customPages || await discoverPages();
    console.log(`✅ Found ${pagesToReview.length} pages to review\n`);

    // Step 2: Capture screenshots for all pages (parallel)
    console.log('📸 Capturing screenshots...');
    const screenshots = await captureAllScreenshots(baseUrl, pagesToReview, viewport);
    console.log(`✅ Captured ${screenshots.length} screenshots\n`);

    // Step 3: Analyze with GPT-4o Vision (sequential for rate limits)
    console.log('🤖 Analyzing with GPT-4o Vision...');
    const analyses: PageAnalysis[] = [];
    
    for (let i = 0; i < screenshots.length; i++) {
      const { page, screenshotBase64 } = screenshots[i];
      console.log(`[${i + 1}/${screenshots.length}] Analyzing ${page.name}...`);
      
      const analysis = await analyzePageWithAI(
        page,
        screenshotBase64,
        viewport,
        strict
      );
      
      analyses.push(analysis);
      console.log(`  Score: ${analysis.score}/100 ${analysis.passed ? '✅' : '❌'}`);
    }

    console.log('\n✅ All pages analyzed\n');

    // Step 4: Calculate overall metrics
    const totalIssues = analyses.reduce((sum, a) => 
      sum + a.issues.length, 0
    );
    
    const summary = {
      totalIssues,
      critical: analyses.reduce((sum, a) => 
        sum + a.issues.filter(i => i.severity === 'critical').length, 0
      ),
      high: analyses.reduce((sum, a) => 
        sum + a.issues.filter(i => i.severity === 'high').length, 0
      ),
      medium: analyses.reduce((sum, a) => 
        sum + a.issues.filter(i => i.severity === 'medium').length, 0
      ),
      low: analyses.reduce((sum, a) => 
        sum + a.issues.filter(i => i.severity === 'low').length, 0
      ),
    };

    const averageScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
    const passRate = (analyses.filter(a => a.passed).length / analyses.length) * 100;

    // Step 5: Generate HTML report
    const reportPath = await generateHTMLReport(analyses, summary, averageScore, passRate, strict);
    console.log(`📄 Report generated: ${reportPath}\n`);

    const result: BatchReviewResponse = {
      success: true,
      totalPages: pagesToReview.length,
      averageScore: Math.round(averageScore),
      passRate: Math.round(passRate),
      pages: analyses,
      summary,
      timestamp: new Date().toISOString(),
      reportPath,
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('❌ Batch review error:', error);
    
    const result: BatchReviewResponse = {
      success: false,
      totalPages: 0,
      averageScore: 0,
      passRate: 0,
      pages: [],
      summary: { totalIssues: 0, critical: 0, high: 0, medium: 0, low: 0 },
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(result, { status: 500 });
  }
}

/**
 * Auto-discover all pages in Next.js app
 */
async function discoverPages(): Promise<PageRoute[]> {
  // Default page list (can be enhanced with dynamic discovery)
  return [
    // Marketing
    { path: '/', name: 'Landing Page', group: 'marketing' },
    { path: '/demo', name: 'Demo', group: 'marketing' },
    
    // Auth
    { path: '/oauth/select', name: 'OAuth Select', group: 'auth' },
    { path: '/oauth/instagram', name: 'Instagram OAuth', group: 'auth' },
    { path: '/onboarding/profile-confirm', name: 'Profile Confirm', group: 'onboarding' },
    
    // App
    { path: '/matching', name: 'Matching', group: 'app' },
    { path: '/analytics', name: 'Analytics', group: 'app' },
    { path: '/assistant', name: 'Assistant', group: 'app' },
    { path: '/settings', name: 'Settings', group: 'app' },
    
    // Legal
    { path: '/legal/privacy', name: 'Privacy Policy', group: 'legal' },
    { path: '/legal/terms', name: 'Terms of Service', group: 'legal' },
  ];
}

/**
 * Capture screenshots for all pages (parallel)
 */
async function captureAllScreenshots(
  baseUrl: string,
  pages: PageRoute[],
  viewport: { width: number; height: number }
): Promise<Array<{ page: PageRoute; screenshotBase64: string }>> {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
  });

  const results = [];

  for (const page of pages) {
    try {
      const browserPage = await context.newPage();
      const url = `${baseUrl}${page.path}`;
      
      await browserPage.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      await browserPage.evaluate(() => document.fonts.ready);

      const screenshot = await browserPage.screenshot({
        fullPage: true,
        type: 'png',
      });

      results.push({
        page,
        screenshotBase64: screenshot.toString('base64'),
      });

      await browserPage.close();
    } catch (error) {
      console.error(`Failed to capture ${page.name}:`, error);
    }
  }

  await browser.close();
  return results;
}

/**
 * Analyze page with GPT-4o Vision
 */
async function analyzePageWithAI(
  page: PageRoute,
  screenshotBase64: string,
  viewport: { width: number; height: number },
  strict: boolean
): Promise<PageAnalysis> {
  const prompt = `Analyze this "${page.name}" page screenshot for ZZIK Design System compliance.

**Quick Check (respond with JSON only):**
1. Colors: Only white/zinc/indigo? (NO emerald/teal/purple/pink)
2. Button height: 48-56px? (WCAG)
3. Text contrast: ≥4.5:1?
4. Shadows: Only subtle (sm/md)?
5. Spacing: 8pt grid aligned?

Respond with:
\`\`\`json
{
  "score": 85,
  "passed": true,
  "issues": [
    {
      "category": "Button Height",
      "severity": "critical",
      "message": "Primary button is 44px (should be 48-56px)"
    }
  ]
}
\`\`\`

Mode: ${strict ? 'STRICT (95/100 required)' : 'STANDARD (85/100 required)'}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a design system validator. Respond with JSON only."
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.1,
    });

    const aiOutput = response.choices[0].message.content || '';
    const jsonMatch = aiOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : aiOutput;
    const parsed = JSON.parse(jsonString);

    const passThreshold = strict ? 95 : 85;

    return {
      path: page.path,
      name: page.name,
      screenshot: screenshotBase64.substring(0, 100) + '...', // Truncate for response
      score: parsed.score || 0,
      passed: (parsed.score || 0) >= passThreshold,
      issues: parsed.issues || [],
      viewport,
    };
  } catch (error) {
    console.error(`AI analysis failed for ${page.name}:`, error);
    return {
      path: page.path,
      name: page.name,
      screenshot: '',
      score: 0,
      passed: false,
      issues: [{ category: 'Error', severity: 'critical', message: 'AI analysis failed' }],
      viewport,
    };
  }
}

/**
 * Generate comprehensive HTML report
 */
async function generateHTMLReport(
  analyses: PageAnalysis[],
  summary: { totalIssues: number; critical: number; high: number; medium: number; low: number },
  averageScore: number,
  passRate: number,
  strict: boolean
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.join(process.cwd(), 'design-reviews', 'batch-reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, `batch-report-${timestamp}.html`);

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZZIK Batch Design Review - ${new Date().toLocaleString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, sans-serif;
      background: #fafafa;
      color: #18181b;
      padding: 2rem;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header {
      background: white;
      border: 1px solid #e4e4e7;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .score-big {
      font-size: 5rem;
      font-weight: 700;
      color: ${averageScore >= 85 ? '#10b981' : '#ef4444'};
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .card {
      background: white;
      border: 1px solid #e4e4e7;
      border-radius: 0.75rem;
      padding: 1.5rem;
    }
    .card.failed { border-left: 4px solid #ef4444; }
    .card.passed { border-left: 4px solid #10b981; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge.critical { background: #fef2f2; color: #dc2626; }
    .badge.high { background: #fff7ed; color: #ea580c; }
    .badge.medium { background: #fefce8; color: #ca8a04; }
    .badge.low { background: #eff6ff; color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">🎨 ZZIK Batch Design Review</h1>
      <p style="color: #52525b; margin-bottom: 2rem;">${new Date().toLocaleString()} • ${strict ? 'STRICT Mode (95/100)' : 'STANDARD Mode (85/100)'}</p>
      
      <div style="display: flex; align-items: center; gap: 3rem;">
        <div>
          <div class="score-big">${Math.round(averageScore)}</div>
          <div style="color: #52525b;">Average Score</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 2rem; font-weight: 700;">${Math.round(passRate)}%</div>
          <div style="color: #52525b;">Pass Rate (${analyses.filter(a => a.passed).length}/${analyses.length} pages)</div>
          
          <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
            <div>
              <div style="font-size: 1.5rem; font-weight: 700; color: #ef4444;">${summary.critical}</div>
              <div style="font-size: 0.875rem; color: #52525b;">Critical</div>
            </div>
            <div>
              <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;">${summary.high}</div>
              <div style="font-size: 0.875rem; color: #52525b;">High</div>
            </div>
            <div>
              <div style="font-size: 1.5rem; font-weight: 700; color: #eab308;">${summary.medium}</div>
              <div style="font-size: 0.875rem; color: #52525b;">Medium</div>
            </div>
            <div>
              <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${summary.low}</div>
              <div style="font-size: 0.875rem; color: #52525b;">Low</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <h2 style="margin-bottom: 1.5rem; font-size: 1.5rem;">📋 Page Analysis</h2>
    
    <div class="grid">
      ${analyses.map(page => `
        <div class="card ${page.passed ? 'passed' : 'failed'}">
          <div style="display: flex; justify-between; align-items: start; margin-bottom: 1rem;">
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 0.25rem;">${page.name}</h3>
              <div style="font-size: 0.875rem; color: #52525b;">${page.path}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 2rem; font-weight: 700; color: ${page.passed ? '#10b981' : '#ef4444'};">
                ${page.score}
              </div>
              <div style="font-size: 0.875rem; color: #52525b;">/100</div>
            </div>
          </div>

          ${page.issues.length > 0 ? `
            <div style="margin-top: 1rem;">
              <div style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Issues (${page.issues.length})</div>
              ${page.issues.slice(0, 3).map(issue => `
                <div style="margin-bottom: 0.5rem;">
                  <span class="badge ${issue.severity}">${issue.severity.toUpperCase()}</span>
                  <div style="font-size: 0.875rem; margin-top: 0.25rem;">${issue.message}</div>
                </div>
              `).join('')}
              ${page.issues.length > 3 ? `<div style="font-size: 0.875rem; color: #52525b; margin-top: 0.5rem;">+ ${page.issues.length - 3} more issues</div>` : ''}
            </div>
          ` : '<div style="color: #10b981; font-weight: 600;">✅ No issues found</div>'}
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(reportPath, html);
  return reportPath;
}
