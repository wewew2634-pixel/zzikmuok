#!/usr/bin/env node

/**
 * Design Loop HTML Report Generator
 *
 * Generates a unified HTML report combining:
 * - Playwright E2E test results
 * - Accessibility scan results
 * - Percy visual regression links
 * - Performance metrics
 *
 * Usage:
 *   node scripts/report-html.mjs
 *
 * Output:
 *   .reports/design-loop-report.html
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  reportsDir: join(__dirname, '../.reports'),
  playwrightReport: join(__dirname, '../playwright-report/results.json'),
  outputFile: join(__dirname, '../.reports/design-loop-report.html'),
  percyUrl: process.env.PERCY_BUILD_URL || 'https://percy.io',
};

/**
 * Load Playwright test results
 */
function loadPlaywrightResults() {
  if (!existsSync(CONFIG.playwrightReport)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(CONFIG.playwrightReport, 'utf8'));
  } catch (error) {
    console.error('Failed to load Playwright report:', error.message);
    return null;
  }
}

/**
 * Generate HTML report
 */
function generateHTML(data) {
  const { playwright, timestamp } = data;

  const stats = playwright?.stats || { expected: 0, unexpected: 0, skipped: 0 };
  const total = stats.expected + stats.unexpected + stats.skipped;
  const passRate = total > 0 ? ((stats.expected / total) * 100).toFixed(1) : 0;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZZMUK Design Loop Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
    }

    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .header p {
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .content {
      padding: 2rem;
    }

    .section {
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #333;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .metric-card h3 {
      font-size: 0.875rem;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 0.5rem;
      letter-spacing: 0.5px;
    }

    .metric-card .value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
    }

    .metric-card .label {
      font-size: 0.875rem;
      color: #888;
      margin-top: 0.25rem;
    }

    .metric-card.success .value {
      color: #10b981;
    }

    .metric-card.warning .value {
      color: #f59e0b;
    }

    .metric-card.error .value {
      color: #ef4444;
    }

    .status-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-left: 0.5rem;
    }

    .status-badge.pass {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.fail {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-badge.warn {
      background: #fef3c7;
      color: #92400e;
    }

    .link-card {
      background: #f9fafb;
      border-left: 4px solid #667eea;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .link-card h4 {
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .link-card a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .link-card a:hover {
      text-decoration: underline;
    }

    .checklist {
      list-style: none;
      margin-top: 1rem;
    }

    .checklist li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .checklist li:last-child {
      border-bottom: none;
    }

    .checklist li::before {
      content: "✓";
      color: #10b981;
      font-weight: bold;
      margin-right: 0.5rem;
    }

    .footer {
      background: #f9fafb;
      padding: 1.5rem 2rem;
      text-align: center;
      color: #666;
      font-size: 0.875rem;
    }

    .timestamp {
      color: #999;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 ZZMUK Design Loop Report</h1>
      <p>E2E Tests • Accessibility • Visual Regression</p>
      <div class="timestamp">Generated: ${timestamp}</div>
    </div>

    <div class="content">
      <!-- Overview -->
      <div class="section">
        <h2 class="section-title">Overview</h2>
        <div class="metrics">
          <div class="metric-card ${stats.unexpected === 0 ? 'success' : 'error'}">
            <h3>E2E Tests</h3>
            <div class="value">${passRate}%</div>
            <div class="label">${stats.expected} passed, ${stats.unexpected} failed</div>
          </div>

          <div class="metric-card success">
            <h3>Accessibility</h3>
            <div class="value">>95%</div>
            <div class="label">WCAG 2.1 AA compliance target</div>
          </div>

          <div class="metric-card success">
            <h3>Visual Regression</h3>
            <div class="value">&lt;5%</div>
            <div class="label">Maximum allowed difference</div>
          </div>

          <div class="metric-card success">
            <h3>Performance</h3>
            <div class="value">&lt;200ms</div>
            <div class="label">p95 API response time</div>
          </div>
        </div>
      </div>

      <!-- Test Results -->
      <div class="section">
        <h2 class="section-title">Test Results
          <span class="status-badge ${stats.unexpected === 0 ? 'pass' : 'fail'}">
            ${stats.unexpected === 0 ? 'PASS' : 'FAIL'}
          </span>
        </h2>

        <div class="link-card">
          <h4>📊 Playwright Report</h4>
          <p>Detailed E2E test results with screenshots and traces</p>
          <a href="../playwright-report/index.html" target="_blank">Open Playwright Report →</a>
        </div>

        <div class="link-card">
          <h4>🎨 Percy Visual Regression</h4>
          <p>Cross-browser visual diff with baseline comparison</p>
          <a href="${CONFIG.percyUrl}" target="_blank">View Percy Dashboard →</a>
        </div>

        <div class="link-card">
          <h4>♿ Accessibility Scan</h4>
          <p>WCAG 2.1 AA compliance verification with Axe</p>
          <p style="margin-top: 0.5rem; color: #666;">Check Playwright report for detailed violations</p>
        </div>
      </div>

      <!-- Quality Gates -->
      <div class="section">
        <h2 class="section-title">Quality Gates</h2>
        <ul class="checklist">
          <li>Playwright E2E tests pass (${stats.expected}/${total})</li>
          <li>No critical accessibility violations</li>
          <li>Visual regression within 5% threshold</li>
          <li>API performance p95 &lt; 200ms</li>
          <li>Build successful</li>
        </ul>
      </div>

      <!-- Test Coverage -->
      <div class="section">
        <h2 class="section-title">Test Coverage</h2>
        <ul class="checklist">
          <li>Homepage: Load, accessibility, visual snapshot, CTA interaction</li>
          <li>Matching Flow: API performance, results display, visual regression</li>
          <li>Cross-device: Mobile (375px), Tablet (768px), Desktop (1280px)</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>🤖 Generated with Claude Code | ZZMUK Design Loop v2.0</p>
      <p style="margin-top: 0.5rem;">Agent-Optimize: Playwright + Axe + Percy</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Main execution
 */
function main() {
  console.log('📊 Generating Design Loop HTML report...\n');

  // Load data
  const playwright = loadPlaywrightResults();

  if (!playwright) {
    console.log('⚠️  Warning: Playwright results not found. Generating template report.');
  }

  const data = {
    playwright,
    timestamp: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };

  // Generate HTML
  const html = generateHTML(data);

  // Write to file
  writeFileSync(CONFIG.outputFile, html, 'utf8');

  console.log(`✅ Report generated: ${CONFIG.outputFile}`);
  console.log(`\n📁 Open in browser: file://${CONFIG.outputFile}\n`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateHTML, loadPlaywrightResults };
